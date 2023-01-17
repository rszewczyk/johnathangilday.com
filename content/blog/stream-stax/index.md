---
title: ☕️ Connecting Java's Streaming API for XML (StAX) with Streams
date: "2022-12-15"
description: >
  On one hand, Java developers love to work with streams of data using the
  `java.util.stream` package, because it is easy to apply transformations,
  filtering, and aggregation. On the other hand, the Streaming API for XML
  (StAX) makes reading XML streamwise easy, but there are no easy ways to
  filter, transform, and aggregate the data. How can a Java developer connect
  these two APIs to use the best of both?
---

I recently had to process large XML documents in Java, so I reached for Java's
Streaming API for XML (StAX). The document had a long list of relatively small
elements. Java's new switch expressions made parsing the XML with StAX much
nicer than I remembered; however, I found myself missing the filtering,
transformation, and aggregation methods from `java.util.stream.Stream`.

I wanted to use StAX to parse the XML elements into a Java record, and I wanted
to use a `Stream` to process those records. In this blog post, I detail how to
do that efficiently.

## Parsing All the Sandwiches

Consider an arbitrarily large XML document containing a list of favorite
sandwiches. Of course, we could parse all the favorite sandwiches into a
`java.util.Collection` then call `stream()`. However, we know this is not
efficient, because it requires the JVM to hold all the data from the large XML
document in memory.

```java
// 🤢 Inefficient, because it reads all the records into memory before processing
List<FavoriteSandwich> sandwiches = parseAllSandwiches("./sandwiches.xml");
Stream sandwichesStream = sandwiches.stream();
```

Instead, we want a `Stream` that parses the XML data as-needed. To build such a
stream, we define a new type that implements `java.util.stream.Spliterator`
interface. A `Spliterator` is the `java.util.stream` equivalent of a cursor, and
it facilitates making new `Stream` instances from data that can be iterated on
and optionally partitioned. In this example, the XML data is given to the
`Spliterator` as an `InputStream`, so it cannot be partitioned.

```java
class FavoriteSandwichXMLSpliterator
    implements Spliterator<FavoriteSandwich> {

  private final XMLEventReader reader;

  public FavoriteSandwichXMLSpliterator(final InputStream is) throws IOException {
    try {
      reader = factory.createXMLEventReader(is);
    } catch (XMLStreamException e) {
      throw new IOException("Failed to parse favorite sandwiches from XML", e);
    }
  }

  ...
```

The `Spliterator` parses the XML as-needed in its `tryAdvance` method.

```java
@Override
public boolean tryAdvance(final Consumer<? super FavoriteSandwich> action) {
  while (reader.hasNext()) {
    final XMLEvent event;
    try {
      event = reader.nextEvent();
    } catch (XMLStreamException e) {
      throw new UncheckedXMLStreamException("Failed to read favorite sandwiches from XML", e);
    }
    if (event.isStartElement()) {
      final StartElement startElement = event.asStartElement();
      if (startElement.getName().getLocalPart().equals("favorite-sandwich")) {
        final FavoriteSandwich sandwich;
        try {
          sandwich = readSandwich(); // implementation omitted for brevity
        } catch (XMLStreamException e) {
          throw new UncheckedXMLStreamException("Failed to read favorite sandwich from XML", e);
        }
        action.accept(sandwich);
        return true;
      }
    }
  }
  return false;
}
```

The remaining methods of the `Spliterator` interface return values that
communicate to the `Stream` that we do not know how long the `Stream` is and it
cannot be partitioned. Finally, all this is encapsulated in a factory method
that returns a new `Stream`.

```java
public Stream<FavoriteSandwich> stream(final InputStream is) throws IOException {
  final var spliterator = new FavoriteSandwichXMLSpliterator(is);
  return StreamSupport.stream(spliterator, false);
}
```

This factory method provides the `Stream<FavoriteSandwich>` that developers want
to use while encapsulating the XML parsing that developers do not want to think
about. For example, it's now incredibly simple to compute a count of favorite
sandwiches by the U.S. state they're from:

```java
@Test
void stream_all_valid_sandwiches() throws IOException {
  final FavoriteSandwichXMLParser reader = new FavoriteSandwichXMLParser();
  try (var is =
      FavoriteSandwichXMLParserTest.class.getResourceAsStream("/favorite-sandwiches.xml")) {
    var sandwiches = reader.stream(is);
    final Map<String, Long> countByState =
        sandwiches.collect(
            groupingBy(sandwich -> sandwich.restaurant().state(), Collectors.counting()));

    final Map<String, Long> expected = Map.of("NJ", 2L, "MD", 3L);
    assertThat(countByState).containsExactlyInAnyOrderEntriesOf(expected);
  }
}
```

Perfect! 🥪

## Resource Management Special Case

In the previous example, the `Stream<FavoriteSandwich>` data was processed
entirely within a try-with-resources statement that ensures the `InputStream`
will be closed. While this is ideal, it may not always be possible to manage the
IO resources this way. For example, consider the case where some existing method
expects a `Supplier<Stream<FavoriteSandwich>>`. In this case, the `Supplier`
cannot use try-with-resources, because it cannot know when to close the
`InputStream`.

```java
// 🐛 Will close the InputStream before any code can operate on the Stream
Supplier<Stream<FavoriteSandwich>> supplier = () -> {
  try (var is =
      FavoriteSandwichXMLParserTest.class.getResourceAsStream("/favorite-sandwiches.xml")) {
    return reader.stream(is);
  } catch (IOException e) {
    throw new UncheckedIOException(e);
  }
};
```

Instead, we want to clean-up the resources when the `Stream` has been closed.
Fortunately, `Stream` implements `AutoCloseable`, and the
[Stream Javadoc](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/stream/Stream.html)
instructs users to close streams that are backed by an IO channel.

> Streams have a BaseStream.close() method and implement AutoCloseable, but
> nearly all stream instances do not actually need to be closed after use.
> Generally, only streams whose source is an IO channel (such as those returned
> by Files.lines(Path, Charset)) will require closing. Most streams are backed
> by collections, arrays, or generating functions, which require no special
> resource management. (If a stream does require closing, it can be declared as
> a resource in a try-with-resources statement.)

We can take advantage of this to handle this special case where the `Stream`
must clean-up the IO channel it encapsulates.

First, we make the `FavoriteSandwichXMLSpliterator` implement `AutoCloseable`.
The `close()` method simply closes the `InputStream` passed to the constructor
and propagates any exceptions as a `RuntimeException`.

```java
@Override
public void close() {
  try {
    reader.close();
  } catch (XMLStreamException e) {
    throw new UncheckedXMLStreamException("Failed to close XMLEventReader", e);
  }
}
```

In this case, we define a new runtime exception `UncheckedXMLStreamException`
that is the StAX analog to `UncheckedIOException`.

Lastly, we change the factory that creates the `Stream`, so that the `Stream`
closes the `Spliterator` when it has been closed. This is made possible by the
`Stream.onClose(Runnable)` method that allows users to schedule arbitrary
routines to be executed when the `Stream` is closed.

```java
public Stream<FavoriteSandwich> stream(final InputStream is) throws IOException {
  final var spliterator = new FavoriteSandwichXMLSpliterator(is);
  return StreamSupport.stream(spliterator, false).onClose(spliterator::close);
}
```

Having made these changes, the `Stream` itself may be in a try-with-resources to
ensure that the IO is closed properly:

```java
void process(final Supplier<Stream<FavoriteSandwich>> supplier) {
  try (var sandwiches = supplier.get()) {
    sandwiches.forEach(System.out::println);
  }
}
```

## Conclusion

Arbitrarily large streams of data, such as a large XML document, are ripe for
processing with the `java.util.stream` APIs, but developers need way to parse
records from the stream as-needed and expose those elements as a `Stream`. The
`Spliterator` interface is the key that unlocks the power of the `Stream` API
for data that may be processed stream-wise. Additionally, when the `Stream` must
also clean-up the underlying IO resources after it has been exhausted, the
`Stream.onClose(Runnable)` method is available to schedule that clean-up.

The accompanying code may be found at
[gilday/how-to-stream-stax](https://github.com/gilday/how-to-stream-stax).
