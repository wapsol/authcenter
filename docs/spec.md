
The **Authentication Centre** serves as a central authentication hub for all enterprise applications that users in a company are registered with and need to access in order to download data into their Private Cloud for further processing. For example, if a user is using Gmail and wishes to download emails for AI processing inside their Private Cloud, they can use the Authentication Hub to provide credentials and authorize this data transfer. This enables authenticated, secure passage of data from internet-based applications into the company’s Private Cloud infrastructure.

We start by supporting Google applications, where robust authentication is managed by Google (OAuth). This includes services like Google Calendar, Gmail, Google Docs, etc. Applications running in the Private Cloud can thus benefit from a **one-way flow of data from public cloud and SaaS services into the Private Cloud**, where the data can be used securely by internal applications. In the future, we plan to expand support for authentication with ecosystems like Amazon Web Services (AWS), Microsoft Azure, Salesforce, and many other OAuth-based services and applications.

### What does the Authentication Hub look like?

The Authentication Hub is a simple, browser-accessible URL where internal applications hosted on the Private Cloud are listed. If a user wishes to download data from external OAuth-authenticated services into a Private Cloud application, they simply authenticate and grant the necessary permissions through the Hub. For example, a user can visit the Authentication Hub, select the Gmail icon, and authorize access to their Gmail data, which can then be processed by an internal AI assistant that helps search and interact with their emails securely inside the Private Cloud.

Additionally, the flow can work in the other direction where relevant: for instance, dates and events from applications running in the Private Cloud can be pushed to the user’s Google Calendar, allowing them to continue using familiar apps on mobile, desktop, and other platforms, while maintaining integration with Private Cloud applications.

### Mapping between off-cloud apps and on-cloud apps

There should be a mapping between SaaS apps that are authenticated on one side by specific users, and on the other side, applications running on the Private Cloud.

The UI should allow any user on the Private Cloud to select an external SaaS app, then select an internal app, and establish a mapping by clicking a button "Authenticate <external_app>" to connect to <internal_app>.

External apps are shown with their brand logos, ex. Google Calendar, Google Mail, Salesforce, Dropbox, Microsoft Office 365 etc. Glassmorphic design elements are also sufficient for now.

### Internal App Catalog

Maintain a catalog of apps in an simple database (sqlite).
Maintain mappings between internal and external apps in the database.
This database also carries the related authenticated users data (usernames, keys, encrypted passwords, tokens etc, as required by the respective applications), along with the related applications.

### Registration of New Apps

An Admin is able to register new apps, both external SaaS apps, and internal Private Apps.

We need a standard protocol and interface that will be published on the Auth Hub which developers of those respective Apps, microservices, scripts etc. 
Suggest these standard.
Give them an appropriate name, and display them on the Auth Hub in a non-obstructive way to day to day users, as new apps are only registered occasionally by respective developers.

### Auth Log and Access Log

For explainability purposes, there should be a way to check which apps were authenticated, successfully or unsucessfully, both on the external and internal sides.
Update logs on the UI in realtime.
This is also an infrequently used feature, hence hide it away under an administrative menu link.