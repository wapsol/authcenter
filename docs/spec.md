
The **Authentication Centre** serves as a central authentication hub for all enterprise applications that users in a company are registered with and need to access in order to download data into their private cloud for further processing. For example, if a user is using Gmail and wishes to download emails for AI processing inside their private cloud, they can use the Authentication Hub to provide credentials and authorize this data transfer. This enables authenticated, secure passage of data from internet-based applications into the company’s private cloud infrastructure.

We start by supporting Google applications, where robust authentication is managed by Google (OAuth). This includes services like Google Calendar, Gmail, Google Docs, etc. Applications running in the private cloud can thus benefit from a **one-way flow of data from public cloud and SaaS services into the private cloud**, where the data can be used securely by internal applications. In the future, we plan to expand support for authentication with ecosystems like Amazon Web Services (AWS), Microsoft Azure, Salesforce, and many other OAuth-based services and applications.

### What does the Authentication Hub look like?

The Authentication Hub is a simple, browser-accessible URL where internal applications hosted on the private cloud are listed. If a user wishes to download data from external OAuth-authenticated services into a private cloud application, they simply authenticate and grant the necessary permissions through the Hub. For example, a user can visit the Authentication Hub, select the Gmail icon, and authorize access to their Gmail data, which can then be processed by an internal AI assistant that helps search and interact with their emails securely inside the private cloud.

Additionally, the flow can work in the other direction where relevant: for instance, dates and events from applications running in the private cloud can be pushed to the user’s Google Calendar, allowing them to continue using familiar apps on mobile, desktop, and other platforms, while maintaining integration with private cloud applications.

