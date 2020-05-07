
# FaceIn:

## Description

Create events for social dances like salsa, swing and tango.

## Motivation

Bring together (almost) all social dance spots worldwide.

## User Stories

**404** - As a user I want to see a nice 404 page when I go to a page that doesn’t exist so that I know it was my fault.

**500** - As a user I want to see a nice error page when the super team screws it up so that I know that is not my fault.

**Homepage** - As a user I want to be able to access the homepage so that I see what the app is about and login and signup.

**Sign up** - As a user I want to sign up on the webpage so that I can see all the events that I could attend.

**Login** - As a user I want to be able to log in on the webpage so that I can get back to my account.

**Logout** - As a user I want to be able to log out from the webpage so that I can make sure no one will access my account.

**Events list** - As a user I want to see all the events available so that I can choose which ones I want to attend.

**Events create** - As a user I want to create an event or several events so that others to attend and I can control who registered by scanning their face with the app at the entrance.

**Events detail** - As a user I want to see the event details and attendee list of one event so that I can decide if I want to attend.

**Attend event** - As a user I want to be able to pay and attend to event so that the organizers can count me in.

**Choose another social dance** - As a user I want to search for places to dance either salsa or swing, etc.

**Chat** - As a user I would like to get in touch with other users that already have registered (paid) for the event.

**User profile** - As a user I want to update my profile and upload an avatar and selfie, and see other users and their profile with their events listed on their profile.

**Dancing spot / institution / school** - As a user I want to register my dancing spot on a map and link my events to that place.

**Rating** - As a user I would like to write a comment and rate a dancing spot.

**Like / unlike an event** - As a user I want to be able to like an event so I can see it on my profile and decide later on if I want to attend.

**Delete** - As a user I want to be able to delete: my dancing spot - my events - participants - ratings.

**Admin** - As an admin I want to be able to delete: users - events - dancing spots - ratings.

## Backlog

List of other features outside of the MVPs scope:

Face recognition: after a user paid and registered for an event, the event-owner can scan the face of the registered user at the entrance and confirm the user on his list.

Geo Location: - add geolocation to events when creating - show event in a map in event detail page - show all events in a map in the event list page

Payment: - As a user I want to pay for the event and make sure my credit card information is safe. (Stripe)

Weekly / Monthly events: As a user I would like to create only once an event that repeats every week or month.

Calendar: show a calender that always loads the events from the current day

## ROUTES Backend:

### Endpoints

| Method | Path                                         | Description                                 | Body                                                                                             |
| :----: | -------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------ |
|  GET   | `/users`                                     | get all users                               |                                                                                                  |
|  GET   | `/users/:userId`                             | get one user                                |                                                                                                  |
|  PUT   | `/users/edit`                                | user can edit his profile                   | `{ username, email, firstName, familyName, avatar, selfie, password }`                           |
| DELETE | `/admin/:userId/delete`                      | admin can delete user                       |                                                                                                  |
| DELETE | `/admin/:eventId/admin-delete`               | admin can delete event                      |                                                                                                  |
| DELETE | `/admin/:institutionId/delete-admin`         | admin can delete dancing place              |                                                                                                  |
|  GET   | `/institutions`                              | get all dancing spots                       |                                                                                                  |
|  GET   | `/institutions/:institutionId`               | get one dancing spot                        |                                                                                                  |
|  POST  | `/institution/add`                           | user can add a dancing place                | `{ institutionName, image, address }`                                                            |
|  PUT   | `/institutions/edit`                         | user can update dancing place               | `{ institutionName, image, address }`                                                            |
| DELETE | `/institutions/delete`                       | user-owner can delete dancing place         |                                                                                                  |
|  POST  | `/institutions/:institutionId/add-rating`    | add and update rating to a dancing place    | `{ title, description, stars }`                                                                  |
| DELETE | `/institutions/:institutionId/delete-rating` | user of rating can delete it                |                                                                                                  |
|  GET   | `/events`                                    | get all events                              |                                                                                                  |
|  GET   | `/events`                                    | get all events                              |                                                                                                  |
|  GET   | `/events/:eventId`                           | get one event                               |                                                                                                  |
|  POST  | `/events/add`                                | user can add an event                       | `{ title, description, frequency, dateStart, dateEnd, timeStart, timeEnd, price, image, tagId }` |
|  PUT   | `/events/edit`                               | update an event                             | `{ title, description, frequency, dateStart, dateEnd, timeStart, timeEnd, price, image, tagId }` |
| DELETE | `/events/delete`                             | owner of the event can delete the event     |                                                                                                  |
|  GET   | `/events/eventId/add-like`                   | like / unlike an event                      |                                                                                                  |
|  GET   | `/events/eventId/register`                   | admin can scan face of participant          |                                                                                                  |
|  GET   | `/tags`                                      | get all tags                                |                                                                                                  |
|  GET   | `/tags/:tagId`                               | get one tag                                 |                                                                                                  |
|  POST  | `/tags/add`                                  | admin can add a tag                         | `{ tagName }`                                                                                    |
| DELETE | `/tags/:tagId/delete`                        | admin can delete tag                        |                                                                                                  |
|  GET   | `/likes`                                     | get all likes                               |                                                                                                  |
|  GET   | `/likes/:likeId`                             | get one like                                |                                                                                                  |
|  GET   | `/ratings`                                   | get all ratings                             |                                                                                                  |
|  GET   | `/ratings/:ratingId`                         | get one rating                              |                                                                                                  |
| DELETE | `/ratings/delete`                            | event-owner OR admin can delete rating      |                                                                                                  |
|  GET   | `/participants`                              | get all participants registered in an event |                                                                                                  |
|  GET   | `/participants/:participantId`               | get one participant                         |                                                                                                  |
|  PUT   | `/participants/:participantsId/scan`         | event-owner can scan face and accept user   | `{ faceScanned }`                                                                                |
| DELETE | `/participants/:participantId/delete`        | event-owner can delete participant          |                                                                                                  |

### Auth

| Method | Path      | Description    | Body                            |
| :----: | --------- | -------------- | ------------------------------- |
|  GET   | `/whoami` | who am i       |                                 |
|  POST  | `/signup` | signup a user  | `{ username, password, email }` |
|  POST  | `/login`  | login a user   | `{ username, password }`        |
|  GET   | `/logout` | logout session |                                 |

## Models

User model

```javascript
{
	username: String;
	hashedPassword: String;
	email: String;
	role: String;
	firstName: String;
	familyName: String;
	avatar: String;
	selfie: String;
	hasInstitution: ObjectId<Institution>;
	eventsOwner: ObjectId<Event>;
	participantEvents: ObjectId<Participant>;
	ratingsGiven: ObjectId<Rating>;
	likesGiven: ObjectId<Like>;
}
```

Institution model

```javascript
{
	institutionName: String;
	image: String;
  institutionOwner: ObjectId<User>;
  institutionHasEvents: ObjectId<Event>;
  ratings: ObjectId<Rating>;
	type: String, default: 'Feature';
	geometry: {
      type: {
        type: String,
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },

}
```

Event model

```javascript
{
	 owner: {
      type: ObjectId,
      ref: 'User',
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    frequency: {
      type: String,
      enum: ['once', 'weekly'],
      default: 'once',
      required: true,
    },
    dateStart: {
      type: Date,
      required: true,
    },
    dateEnd: {
      type: Date,
      required: true,
    },
    timeStart: {
      type: Number,
      required: true,
    },
    timeEnd: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      default: 0.0,
    },
    image: {
      type: String,
    },
    belongsToInstitution: {
      type: ObjectId,
      ref: 'Institution',
      required: true,
    },
    tag: {
      type: ObjectId,
      ref: 'Tag',
      required: true,
    },
    participants: [{
      type: ObjectId,
      ref: 'Participant',
    }],
    likes: [{
      type: ObjectId,
      ref: 'Like',
    }],
    numberOfLikes: {
      type: Number,
      default: 0,
    },
}
```

## VIEWS Frontend:

|        View (Component)        | Path                                             | Description                                                                                                          |
| :----------------------------: | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
|              Home              | `/`                                              | landing page with description of FaceIn                                                                              |
|             Login              | `/login`                                         | login a user                                                                                                         |
|             Signup             | `/signup`                                        | signup a user                                                                                                        |
|             Logout             | `/logout`                                        | logout session                                                                                                       |
|             NavBar             | `/`                                              |                                                                                                                      |
|           EventsList           | `/`                                              | protected view: all events                                                                                           |
|         EventsDetails          | `/events/:eventId`                               | details of the event                                                                                                 |
|            Profile             | `/:userId`                                       | protected view: user profile with all likes and ratings that he gave to an event, all his events and his dancingspot |
|          Edit Profile          | `/:userId/edit`                                  | protected view: user can update his details                                                                          |
|        Add Institution         | `/:userId/add-spot`                              | protected view: user can add one dancing spot                                                                        |
|           Add Event            | `/:userId/add-event`                             | protected view: user can add an event                                                                                |
|       Update Institution       | `/:userId/:institutionId/update-spot`            | protected view: user can edit spot                                                                                   |
|          Update Event          | `/:userId/events/:eventId/update-event`          | protected view: user can edit event                                                                                  |
|             Search             | `/events/search`                                 | search for an event and filter with tags                                                                             |
|             Search             | `/events/:eventId/register`                      | register for an event                                                                                                |
|          Admin-Users           | `/admin/users`                                   | admin can see all users, filter them and delete one                                                                  |
|          Admin-Events          | `/admin/events`                                  | admin can see all events, filter them and delete one                                                                 |
|         Admin-Ratings          | `/admin/ratings`                                 | admin can see all ratings, filter them and delete one                                                                |
| Event-Owner access Participant | `/:userId/events/:eventId/:participantId/access` | event-owner can give access to the event to a participant                                                            |

## Links

### Trello

Link to Trello

### Git

The url to your repository and to your deployed project

[Repository Link](http://github.com/)

[Deploy Link](http://heroku.com/)

### Slides

[Slides Link](http://slides.com/)
