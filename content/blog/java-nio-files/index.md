---
title: ☕️ Reasons to Prefer Java's New I/O for Working With Files
date: "2023-01-16"
description: >
  When Java introduced the java.nio.file package for working with files (in
  version 1.7), Java did not deprecate the existing java.io.File type. Is there
  a reason to prefer one of these seemingly duplicative strategies for working
  with files? I argue there is.
---

If you're like me, you associate the `java.nio` package introduced in Java 1.7
with nonblocking IO. For years, I ignored the `java.nio.file` sub-package,
because I was not working with the nonblocking IO types in `java.nio`. I wrongly
assumed that meant I did not need to consider the types in `java.nio.file`. What
I eventually came to learn is the "n" in `java.nio` **does not** stand for
_nonblocking_; rather, it stands for _new_ (according to
[JSR 51](https://jcp.org/en/jsr/detail?id=51)).

Referring to `java.nio.file`, JSR 51 says it introduces "an improved file system
interface". More than a decade after the release of this improved file system
interface, I find that Java developers still feel more comfortable writing code
that uses `java.io.File` instead. In this article, we'll explore some reasons
why it's time to consider using `java.nio.file` instead of `java.io.File` in
your next Java project.

## Error Handling

Consider the following `java.io.File` code for creating a directory:

```java
var dir = new File("my-new-directory");
if (!file.mkdir()) {
  // failed to make directory, handle error
}
```

Note the error case. The `mkdir` method returns a boolean that indicates whether
the directory was created. It's too easy for developers to forget to check the
boolean returned by `mkdir` and handle this case.

Even when developers do remember to check the returned boolean, all they know is
that the directory wasn't created. They can't know if this is an error they
should ignore or not. Was the directory not created, because the directory
already exists or because someone ripped the hard drive out? We can't tell.

Rather than returning a boolean, throwing an exception is an idiomatic way to do
error handling in Java. The `java.nio.file` APIs throw exceptions to communicate
errors. Consider the same code using `java.nio.file`:

```java
var dir = Paths.get("my-new-directory")
try {
    Files.createDirectory(dir);
} catch (FileAlreadyExistsException ignored) {
} catch (IOException e) {
  // something horrible has happened
}
```

Here, we can use different exception types to handle cases differently. There's
more information communicated in these exceptions than simply a returned
`false`.

This example only considered the "creating a directory" use case, but this
pattern may be found throughout the APIs for working with the file system.
"Better error handling" is an improvement that any Java program can benefit
from.

## File System Abstraction

The `java.nio.file` package introduces a `FileSystem` abstraction for modeling a
file system. Of course, most use cases will only ever use the default
`FileSystem` (returned by `FileSystems.getDefault()`), but this is a powerful
concept that allows for more advanced use cases.

My favorite use case for this abstraction is leveraging an in-memory file system
like [google/jimfs](https://github.com/google/jimfs). This can be particularly
useful for speeding up automated tests that perform a lot of file system
operations with small files, because the in-memory file system is so much faster
than a file system on disk.

Consider this test set-up example that injects an in-memory file system into a
class `MyDocumentManager` that performs a lot of file system operations.

```java
class MyDocumentManagerTest {

  private FileSystem fs;
  private MyDocumentManager documents;

  @Before
  void before() {
    fs = Jimfs.newFileSystem(Configuration.unix());
    // inject in-memory file system into MyDocumentManager for testing
    documents = new MyDocumentManager(fs);
  }

  @After
  void after() {
    fs.close();
  }
}
```

Cloud storage is another good use case for this abstraction. Google Cloud's
[com.google.cloud.storage.contrib.nio](https://cloud.google.com/java/docs/reference/google-cloud-nio/latest/com.google.cloud.storage.contrib.nio)
package makes available a Google Cloud Storage backed `FileSystem`. With this
implementation, Java programs can access data in Google Cloud Storage with the
same APIs they use to access files on disk.

```java
Path path = Paths.get(URI.create("gs://bucket/lolcat.csv"));
List<String> lines = Files.readAllLines(path, StandardCharsets.UTF_8);
```

To benefit most from this abstraction, developers must be mindful not to
inadvertently couple their code to the default file system. This coupling
happens when users call APIs that reference the static global
`FileSystems.getDefault()`. Typically, this happens inadvertently via other
static accessors like `Path.of`:

```java
class MyDocumentManager {

  private String root;

  public void save(String name, InputStream is) {
    var path = Path.of(root, name); // ⚠️ Inadvertently couples to default file system
    Files.copy(is, path);
  }
}
```

Instead, developers should apply good inversion of control practices when
working with the file system. That is, prefer to inject a root `Path` or
`FileSystem` instead of obtaining a reference from a static accessor:

```java
class MyDocumentManager {

  private Path root;

  public void save(String name, InputStream is) {
    var path = root.resolve(name); // ✅ resolves relative to injected Path root
    Files.copy(is, path);
  }
}
```

In the second example, the `MyDocumentManager` type is not coupled to any
particular `FileSystem`; rather, it uses whatever `FileSystem` the injected
`Path` root belongs to.

## Misc

There are a handful of other benefits to the `java.nio.file` APIs that I'll
succinctly list here:

- Processing directory listings as a `Stream`
- Convenience methods for reading files e.g. `Files.lines(Path)`,
  `newInputStream(Path)`, and `newBufferedReader(Path)`.
- Watching directories and files for changes.
- Matching file paths to a pattern (e.g. globbing).

One day, I'll find the time to expand these bullets into proper headings of
their own.

## Conclusion

The `java.nio.file` APIs are not new, but they are to many developers accustomed
to using `java.io.File`. In this article, we explored a handful of reasons why
developers should prefer to use `java.nio.file` instead of `java.io.File` for
file system access on their next Java project.
