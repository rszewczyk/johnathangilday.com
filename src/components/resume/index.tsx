import React from "react"
import { css } from "@emotion/core"
import { breakpoints, media } from "../../utils/responsive"

import Container from "../container"
import Era from "./era"
import Event from "./event"
import Timeline from "./timeline"

export default ({ timeline }) => (
  <Container width={breakpoints.large}>
    <header
      css={{
        textAlign: "center",
        padding: "1rem 0",
      }}
    >
      <h1>Johnathan Gilday</h1>
      <p>
        <a href="mailto:me@johnathangilday.com">me@johnathangilday.com</a>
      </p>
      <p>
        Boring, standard, one-page PDF resume available{" "}
        <a href="https://drive.google.com/open?id=0B9eH1qcLQxi-eHZURnJOQ2xHQnc">
          here
        </a>
      </p>
    </header>
    <Timeline>
      {Object.entries(timeline).map(([era, events]) => (
        <Era key={era} title={era}>
          {events.map(event => (
            <Event key={event.date} event={event} />
          ))}
        </Era>
      ))}
    </Timeline>
  </Container>
)
