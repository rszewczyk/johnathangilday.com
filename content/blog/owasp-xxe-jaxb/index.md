---
title: 🔒 XML External Entity Pitfalls With JAXB
date: "2020-09-16"
description: >
  I spent a few weeks in "Java XML Hell", and I learned that securely parsing
  untrusted XML in Java is more difficult than it seems. Contrast Security
  published my research to its Security Influencers blog, and OWASP accepted my
  change request to remove misleading guidance from its XXE Cheat Sheet.
---

I work on a Java agent tool at Contrast Security that detects web application
vulnerabilities at runtime. Recently, Contrast reported an XML External Entities
(XXE) vulnerability in a user's web application that uses JAXB to parse XML. The
user questioned the validity of this vulnerability report. This user's false
positive claim sent me down the rabbit hole researching what I called Java XML
Hell. This research ultimately resulted in a change to
[OWASP's XXE Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html).
I discovered that securing JAXB against XXE attacks is really difficult, and the
Contrast Java agent accurately reported the application to be vulnerable 🙌.

Before accepting our proposed changes, the OWASP XXE Cheat Sheet advised OpenJDK
1.8 users that their JAXB applications are safe from XXE attacks. The advice
read:

> Since JDK-8010393, which is in OpenJDK 8 beta 86,
> `javax.xml.bind.Unmarshaller` instances are safe by default. The other classes
> mentioned here are still unsafe by default in Java 8.

While researching this issue, I discovered that an application parsing untrusted
XML on an OpenJDK 1.8 runtime may be vulnerable to XXE when:

- the JAXB runtime has been inadvertently replaced with a different JAXB runtime
  that is not safe-by-default (e.g. EclipseLink MOXy)
- the secure SAX parser that the OpenJDK 1.8 `Unmarshaller` uses has been
  inadvertently replaced with a different implementation that is not
  safe-by-default (e.g. xercesImpl:2.8.0)
- the application uses one of the `unmarshal` overloads that does not delegate
  XML parsing to the safe-by-default SAX parser

Given all of these caveats, I do not think that OpenJDK 1.8 users should assume
that their JAXB `Unmarshaller` is safe from XXE attacks by default.

Contrast Security
[published my research to its Security Influencer's blog](https://www.contrastsecurity.com/security-influencers/xml-xxe-pitfalls-with-jaxb),
and
[OWASP accepted my change request](https://github.com/OWASP/CheatSheetSeries/issues/488)
to remove the misleading guidance from its XXE Cheat Sheet.

This is not the first time I have written about securing XML and Java. Last
year, I wrote an article for Baeldung about how to
[secure XStream from Remote Code Exploitation](https://www.baeldung.com/java-xstream-remote-code-execution).
One thing I have learned at Contrast Security is that tracing the relationships
between the various Java XML technologies and how to secure them is enough to
make anyone's head spin!
