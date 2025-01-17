---
title: 🍎 Installing and Managing Java on macOS
date: "2020-09-07"
description: >
  Developers on macOS may feel more lost than usual when considering their
  options for installing Java. In my experience, using Homebrew to install
  Eclipse Temurin packages is the best general solution for installing Java on
  macOS.
---

**Update 2021-10-13: AdoptOpenJDK has migrated to the Eclipse Foundation and is
now Temurin. This post has been updated to reflect this migration.**

Changes to how Java is released and licensed may have macOS users feeling more
lost than usual when considering their options for installing the JDK. Given the
licensing changes Oracle made to Java after version 1.8, using Oracle's
installer may not always be an option. With Java's new six-month release cycle,
developers are more likely to need a handful of different versions of the JDK
installed. In this post, I explain how I use Homebrew to install Eclipse Temurin
packages and manage multiple versions of Java with built-in shell tools.

## Installing Java

1. [Uninstall any existing JDKs](https://docs.oracle.com/javase/8/docs/technotes/guides/install/mac_jdk.html#A1096903).

   Execute `java -version` to double-check that Java is truly gone from the
   environment.

1. Find the Eclipse Temurin HomeBrew packages for the versions of Java you need
   ```shell
   brew search temurin
   ```
1. Install the JDK versions you need e.g.
   ```shell
   brew install temurin@11
   ```
1. Configure `JAVA_HOME` in your shell with the default version of Java. This
   guide assumes you use ZSH because that is the default shell since macOS
   Catalina
   ```shell
    export JAVA_HOME=$(/usr/libexec/java_home -v 11)
    path+=$JAVA_HOME/bin
   ```
1. Reload the shell configuration confirm that Java works
   ```shell
   . ~/.zshrc
   java -version
   ```

## Switching Java Versions

Users can install multiple JDKs by installing multiple Temurin HomeBrew
packages. The macOS program `/usr/libexec/java_home` helps users configure their
`JAVA_HOME` environment variable.

```shell
# switches to JDK 14
export JAVA_HOME=$(/usr/libexec/java_home -v 14)
```

There is no need to update the `PATH` variable. The ZSH `path` array will
automatically update to reflect the changes to the `JAVA_HOME` variable.

This command may be too verbose to type every time, so the
[HomeBrew AdoptOpenJDK Tap README recommends adding this function to your shell configuration to succinctly switch your JDK version](https://github.com/AdoptOpenJDK/homebrew-openjdk):

```shell
jdk() {
    version=$1
    export JAVA_HOME=$(/usr/libexec/java_home -v"$version");
    java -version
}
```

### Automatically Switching Java Versions

The command `jdk 1.8` is succinct, but you still need to remember to type it
when switching between a handful of different projects. To save yourself the
trouble of remembering, you can configure your shell to automatically update
`JAVA_HOME` whenever you change to your project's directory. This is a popular
feature in shell scripts like [jenv](https://www.jenv.be/) and
[virtualenv](https://virtualenvwrapper.readthedocs.io/en/latest/tips.html#automatically-run-workon-when-entering-a-directory).
Fortunately, this feature is incredibly easy to emulate with some ZSH
configuration.

First, in your project's root directory, store the version of Java the project
requires in a new `.java-version` file. The name `.java-version` is significant
only because this is the same name that the analogous jenv feature uses, and
using a common name helps share this configuration with any jenv users that
contribute to your project.

```shell
echo 1.8 > .java-version
```

Next, we need to add a hook to our ZSH configuration that will look for and act
on this file whenever the shell changes directories. Add the following to
`$HOME/.zshrc`.

```shell
# automatic java_home switch when .java-version detected
function chpwd() {
  if [[ -f $PWD/.java-version ]]; then
    version=$(cat $PWD/.java-version)
    export JAVA_HOME=$(/usr/libexec/java_home -v $version)
  fi
}
```

Lastly, reload your ZSH configuration and test it out

```shell
# create two test project directories
mkdir java-8-project java-11-project

# configure each test project directory to use a different version of Java
echo 1.8 > java-8-project/.java-version
echo 11 > java-11-project/.java-version

# test Java version in java-8-project
cd java-8-project
java -version

# switch to java-11-project and test Java version
cd ../java-11-project
java -version
```

## Why not use the Oracle installer?

Traditionally, the most straightforward way to download Java has always been to
search "download Java" and follow the first link from Oracle to download the
macOS installer. Oracle's macOS installer takes care of installing and
automatically updating Java. One of the problems with the installer is that it
will insist on upgrading to the latest version of Java. Especially given Java's
new six-month release cycle, upgrading to the latest version is probably too
volatile for most large projects.

The installer is not the only reason you might avoid a Java release from Oracle.
Oracle has made its licensing more restrictive, and you may need a paid
subscription to use it. For example, After April 16, 2019, developers can no
longer use Oracle's Java 1.8 release for commercial purposes without buying a
subscription.

## Why Eclipse Temurin?

There are a lot of OpenJDK distributions to choose from. The excellent article
[Java is Still Free](https://medium.com/@javachampions/java-is-still-free-3-0-0-ocrt-2021-bca75c88d23b)
is the best resource for navigating these choices. The two most important things
to remember are:

1. The open-source project OpenJDK does not distribute binary releases. It makes
   the OpenJDK source code available for others to build and distribute OpenJDK
   distributions.
2. Companies and organizations that provide OpenJDK distributions differentiate
   their offerings primarily through maintenance, support, and added features.

The average Java developer wants an OpenJDK distribution that is simple, free,
has no strings attached, and is easy to install. OpenJDK distributions from the
Eclipse Temurin project fit these criteria well. Temurin, formerly AdoptOpenJDK,
is part of the Eclipse Foundation and makes OpenJDK distributions freely
available. They do not offer commercial support, so they are not trying to
up-sell developers. Their mission is

> Providing the Java community with rock-solid runtimes and associated tools
> that can be used free of charge, without usage restrictions on a wide range of
> platforms.

While they do not offer support, Temurin is one of a handful of OpenJDK
distributions that passes the Java Technology Compatibility Kit and provides
free updates (including security) for releases as far back as Java 8.

Sounds good to me 😁. Temurin is readily available in Docker images on
[Docker Hub](https://hub.docker.com/_/eclipse-temurin), in
[HomeBrew packages](https://formulae.brew.sh/cask/temurin), and in archives on
[adoptium.net](https://adoptium.net).
