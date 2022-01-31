# nodejs-sample

This is an example of API app architecture 

It shows the way how n-layer design can be implemented based on provided requirements 

In short,

"routing" is basically Controllers

"handlers" are Services for the outside use of API (e.g. mobile app)

"data-resolvers" are Services for internal use, like working with Firebase, Cloud messaging, scheduled tasks

"repositories" are for communication with database (raw queries & with use of ORM)
