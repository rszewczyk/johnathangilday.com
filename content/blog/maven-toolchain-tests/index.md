---
title: 🦉 Testing Across JDKs with Maven Toolchains
date: "2021-06-10"
description: >
  Maven users who want to test their Java projects against different JDKs often
  do so by re-running their Maven build with each such JDK. Maven's Toolchains
  plugin offers an alternative strategy for testing across JDKs.
---

Some Maven users need to verify that their Java project is compatible with
multiple JDKs. Typically, users perform this testing by configuring their CI to
re-run their Maven build with each such JDK. This works, but there are some
downsides:

- **Restarting the whole build is slow.** You only want to re-run the tests, but
  re-running the build means you have to re-run phases prior to the testing
  phase as well. If you're running integration tests, this means recompiling and
  repackaging you application each time.

- **Your entire Maven build must be compatible with each JDK version you need to
  test with.** Suppose you want to test your application with JDK 1.7, but you
  rely on Maven plugins that require JDK 1.8. When you re-run the Maven build
  with JDK 1.7, those Maven plugins will not work.

- **Rebuilding the artifact reduces fidelity in testing.** Your goal is to test
  the Java artifacts you intend to release. However, when you re-run the build,
  you produce new artifacts each time. There's little chance this will lead to
  meaningful incompatibilities, but why leave it to chance.

## Configuring Maven Toolchains

[Maven's Toolchains feature](https://maven.apache.org/guides/mini/guide-using-toolchains.html)
helps users include different JDKs throughout their build. This helps to
separate your build's JDK requirements from the JDK you use to compile and test
your code. In this post, we'll configure a Maven build to run integration tests
with multiple JDKs using Maven Toolchains.

Before you can use Maven Toolchains, you must have
[configured a toolchains.xml](https://maven.apache.org/ref/3.8.1/maven-core/toolchains.html).
The file belongs in `$M2_HOME/toolchains.xml`. This example has two JDKs
defined:

```xml
<?xml version="1.0" encoding="UTF8"?>
<toolchains>
  <!-- JDK toolchains -->
  <toolchain>
    <type>jdk</type>
    <provides>
      <version>1.8</version>
      <vendor>eclipse</vendor>
    </provides>
    <configuration>
      <jdkHome>/Library/Java/JavaVirtualMachines/adoptopenjdk-8.jdk/Contents/Home</jdkHome>
    </configuration>
  </toolchain>
  <toolchain>
    <type>jdk</type>
    <provides>
      <version>11</version>
      <vendor>eclipse</vendor>
    </provides>
    <configuration>
      <jdkHome>/Library/Java/JavaVirtualMachines/adoptopenjdk-11.jdk/Contents/Home</jdkHome>
    </configuration>
  </toolchain>
</toolchains>
```

## Configuring Multiple Test Runs

Maven runs unit tests with the Maven Surefire Plugin and integration tests with
the Maven Failsafe Plugin. Both of these plugins work with the Maven Toolchains
feature, and both may be configured to run the test suite multiple times with
different JDKs.

In this example, we'll configure the Maven Failsafe Plugin to run integration
tests on JDKs 1.8 and 11. This is done by adding two distinct executions to the
plugin (distinguished by the execution ID) that use different toolchains.

```xml
<plugin>
  <artifactId>maven-failsafe-plugin</artifactId>
  <executions>
    <execution>
      <id>jdk-1.8</id>
      <goals>
        <goal>integration-test</goal>
        <goal>verify</goal>
      </goals>
      <configuration>
        <jdkToolchain>1.8</jdkToolchain>
      </configuration>
    </execution>
    <execution>
      <id>jdk-11</id>
      <goals>
        <goal>integration-test</goal>
        <goal>verify</goal>
      </goals>
      <configuration>
        <jdkToolchain>11</jdkToolchain>
      </configuration>
    </execution>
  </executions>
</plugin>
```

Note that this only works with the 3.x releases of the Maven Surefire and
Failsafe plugins. If you try this with the 2.x releases, then Maven will run the
first execution and skip the second one with a message like:

```
[INFO] --- maven-failsafe-plugin:2.22.2:integration-test (jdk-11) @ maven-toolchains-testing ---
[INFO] Skipping execution of surefire because it has already been run for this configuration
```

Having configured the Maven Failsafe Plugin with multiple executions, we can run
`mvn verify` and note that the build output shows both executions:

```
INFO] --- maven-failsafe-plugin:3.0.0-M5:integration-test (jdk-1.8) @ maven-toolchains-testing ---
[INFO] Toolchain in maven-failsafe-plugin: JDK[/Library/Java/JavaVirtualMachines/adoptopenjdk-8.jdk/Contents/Home]
[INFO]
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running com.github.gilday.AppIT
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 10.036 s - in com.github.gilday.AppIT
[INFO]
[INFO] Results:
[INFO]
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
[INFO]
[INFO]
[INFO] --- maven-failsafe-plugin:3.0.0-M5:integration-test (jdk-11) @ maven-toolchains-testing ---
[INFO] Toolchain in maven-failsafe-plugin: JDK[/Library/Java/JavaVirtualMachines/adoptopenjdk-11.jdk/Contents/Home]
[INFO]
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running com.github.gilday.AppIT
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 10.034 s - in com.github.gilday.AppIT
[INFO]
[INFO] Results:
[INFO]
[INFO] Tests run: 1, Failures: 0, Errors: 0, Skipped: 0
[INFO]
[INFO]
[INFO] --- maven-failsafe-plugin:3.0.0-M5:verify (jdk-1.8) @ maven-toolchains-testing ---
[INFO]
[INFO] --- maven-failsafe-plugin:3.0.0-M5:verify (jdk-11) @ maven-toolchains-testing ---
```

## Trade-Offs

We've already discussed the downsides of re-running Maven with different JDKs to
test across JDKs. Now, let's consider the downside of this approach.

When users configure their CI build to re-run Maven using different JDKs, they
can often configure the CI to run these distinct Maven builds in parallel. This
alleviates the build time problem, because each build happens concurrently.

With the Maven Toolchains strategy, we cannot run the tests across different
JDKs concurrently. Maven's multi-threaded build feature is limited to building
modules in the reactor concurrently: it does not provide concurrent building
within a module (as Gradle does). One way to workaround this is to put each
integration test suite in its own Maven module (in a multi-module project) so
that the multi-threaded build system can run them in parallel. However, this
configuration introduces a lot of boilerplate `pom.xml` code.

## Conclusion

Maven's Toolchains feature is great for separating your build's JDK requirements
from your code's JDK requirements. We demonstrated how to use Maven Toolchains
to re-run integration tests on multiple JDKs in a single Maven build. The code
for this example can be found on GitHub in
[gilday/maven-toolchains-testing](https://github.com/gilday/maven-toolchains-testing).
