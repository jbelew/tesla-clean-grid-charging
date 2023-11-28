# Tesla Clean Grid Charging

As of November 27, 2023, Tesla has started disabling the core API endpoints crucial for the functionality of this app. Specifially, vehicle location information (impacting geofencing of the charge management functionality) and commands to pause and enable charging. The intended replacement is Tesla's new Fleet API; however, this is a paid service and not a viable option for this project's intended audience. Unfortunately, this means it's time to move on (for now), but it was a great learning experience. 

![Screenshot of the application](https://github.com/jbelew/tesla-clean-grid-charging/blob/master/public/screenshot.png?raw=true)

~~Welcome to the Tesla Clean Grid Charging App – a tool designed for environmentally conscious Tesla owners with a passion for technology. This app allows users to optimize their vehicle charging based on the availability of fossil-free energy on the grid, providing near real-time insights to enhance the sustainability of your Tesla ownership.~~

## Features

- Integration and orchestration of Tesla and Electricity Maps APIs.
- Minimal user data stored locally, ensuring privacy.
- Secure handling of API keys and secrets, never passed via the browser.
- Built with Node, React, Tailwind, Charts.js, rxjs, and Next.js.
- Designed to be run within a small Docker container on a Raspberry Pi or other low power home server options. 

## Motivation

This project stems from a desire to blend technology and environmental conservation, contributing to a better future. 

In first trying to orchestrate a solution like this in Home Assistant, I found the idle energy loss to be just too inefficient. Minimizing vehicle wake state and limiting unintended battery drain is a core design concept of this App.

## Data Security

Minimal user data is stored locally and never shared externally. API keys and secrets are transmitted only via the server, never exposed through the browser.

## Future Plans

The roadmap includes exploring the migration to the Tesla Fleet API for enhanced functionality. However, it's important to note that this transition may involve considerations related to accessibility for the average user, as the Tesla Fleet API is behind a paywall.

## Contribution

Contributions and feedback are welcome! Feel free to open issues or submit pull requests to help improve this project.

## Acknowledgments

This project is made possible by the Tesla and Electricity Maps APIs. Special thanks to the open-source community for their continuous support.

Happy charging!

