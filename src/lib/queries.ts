import { gql } from '@apollo/client';

export const GET_COMMUNITIES = gql`
  query GetCommunities($filters: CommunityFilter) {
    communities(filters: $filters) {
      data {
        id
        title
        short_description
        full_description
        members_quantity
        images
        slug
        organizers {
          id
          username
          email
        }
        events {
          id
          title
          start_date
        }
        tags {
          id
          value
        }
        links {
          id
          url
        }
      }
    }
  }
`;

export const GET_COMMUNITY_BY_ID = gql`
  query GetCommunityById($id: String!) {
    community(id: $id) {
      id
      slug
      title
      short_description
      full_description
      members_quantity
      images
      organizers {
        id
        username
        email
      }
      events {
        id
        documentId
        slug
        title
        start_date
        end_date
      }
      tags {
        id
        value
      }
      links {
        id
        name
        url
      }
    }
  }
`;

export const GET_COMMUNITY_BY_SLUG_OR_ID = gql`
  query GetCommunityBySlugOrId($slugOrId: String!) {
    communityBySlugOrId(slugOrId: $slugOrId) {
      id
      slug
      title
      short_description
      full_description
      members_quantity
      images
      organizers {
        id
        username
        email
      }
      events {
        id
        documentId
        slug
        title
        start_date
        end_date
      }
      tags {
        id
        value
      }
      links {
        id
        name
        url
      }
    }
  }
`;

export const GET_EVENTS = gql`
  query GetEvents($filters: EventFilter, $sort: [EventSort]) {
    events(filters: $filters, sort: $sort) {
      data {
        id
        documentId
        slug
        title
        description
        start_date
        end_date
        images
        communities {
          id
          slug
          title
          short_description
          full_description
        }
        talks {
          id
          documentId
          title
          speakers {
            id
            name
            avatar
          }
        }
        location {
          title
          region
          latitude
          longitude
          google_maps_url
          full_address
          city
        }
      }
    }
  }
`;

export const GET_TAGS = gql`
  query GetTags {
    tags {
      data {
        id
        value
        events {
          id
          title
        }
        communities {
          id
          title
        }
      }
    }
  }
`;

export const GET_LOCATIONS = gql`
  query GetLocations {
    locations {
      data {
        id
        title
        region
        latitude
        longitude
        google_maps_url
        full_address
        city
      }
    }
  }
`;

export const GET_EVENT_BY_SLUG_OR_ID = gql`
  query GetEventBySlugOrId($slugOrId: String!) {
    eventBySlugOrId(slugOrId: $slugOrId) {
      id
      documentId
      slug
      title
      description
      start_date
      end_date
      images
      max_slots
      subscription_link
      communities {
        id
        slug
        title
        short_description
        full_description
        images
      }
      talks {
        id
        documentId
        title
        description
        room_description
        highlight
        occur_date
        speakers {
          id
          name
          avatar
        }
      }
      products {
        id
        enabled
        name
        batches {
          id
          batch_number
          value
          max_quantity
          enabled
          half_price_eligible
        }
      }
      location {
        id
        title
        region
        latitude
        longitude
        google_maps_url
        full_address
        city
      }
    }
  }
`;

// Authentication Mutations
export const SIGN_UP = gql`
  mutation SignUp($input: UserInput!) {
    signUp(input: $input) {
      email
      username
    }
  }
`;

export const SIGN_IN = gql`
  mutation SignIn($identifier: String!, $password: String!) {
    signIn(identifier: $identifier, password: $password) {
      token
    }
  }
`;

export const FORWARD_PASSWORD = gql`
  mutation ForwardPassword($email: String!) {
    forwardPassword(email: $email)
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($code: String!, $password: String!, $passwordConfirmation: String!) {
    resetPassword(code: $code, password: $password, passwordConfirmation: $passwordConfirmation)
  }
`;

export const GET_TALK_BY_ID = gql`
  query GetTalkById($talkId: String!) {
    talk(id: $talkId) {
      id
      title
      description
      subtitle
      room_description
      highlight
      speakers {
        id
        name
        avatar
        biography
      }
      event {
        id
        title
        start_date
        end_date
        images
        location {
          title
          region
          latitude
          longitude
          google_maps_url
          full_address
          city
        }
        communities {
          id
          slug
          title
          short_description
          images
        }
      }
    }
  }
`;

export const GET_AGENDAS = gql`
  query GetAgendas {
    agendas {
      data {
        documentId
        event {
          documentId
          title
          images
        }
      }
    }
  }
`;

export const GET_AGENDA_BY_ID = gql`
  query GetAgendaById($agendaId: String!) {
    agenda(id: $agendaId) {
      talks {
        documentId
        title
        subtitle
        occur_date
      }
    }
  }
`;

// Agenda Mutations
export const CREATE_AGENDA = gql`
  mutation CreateAgenda($input: AgendaInput!) {
    createAgenda(input: $input) {
      documentId
    }
  }
`;

export const UPDATE_AGENDA = gql`
  mutation UpdateAgenda($updateAgendaId: String!, $input: AgendaUpdateInput!) {
    updateAgenda(id: $updateAgendaId, input: $input) {
      documentId
      event {
        title
      }
    }
  }
`;

// Query to get agenda by event ID
export const GET_AGENDA_BY_EVENT_ID = gql`
  query GetAgendaByEventId($eventId: String!) {
    agendas(filters: { event: { documentId: { eq: $eventId } } }) {
      data {
        documentId
        talks {
          documentId
        }
      }
    }
  }
`;

// Comment Queries and Mutations
export const CREATE_COMMENT = gql`
  mutation CreateComment($input: CommentInput!) {
    createComment(input: $input) {
      comment
    }
  }
`;

export const GET_COMMENTS = gql`
  query GetComments($talkId: String!) {
    comments(
      filters: { talk: { documentId: { eq: $talkId } } }
      populate: ["talk", "user_creator"]
    ) {
      data {
        comment
        talk {
          title
        }
        user {
          username
        }
      }
    }
  }
`;

export const GET_USER_BY_USERNAME = gql`
  query UserByUsername($username: String!) {
    userByUsername(username: $username) {
      username
      email
      speaker {
        avatar
      }
      agenda {
        event {
          title
          images
        }
      }
    }
  }
`;

// Event Management Mutations
export const CREATE_EVENT = gql`
  mutation CreateEvent($data: EventInput!) {
    createEvent(data: $data) {
      id
      title
      slug
    }
  }
`;

export const UPDATE_EVENT = gql`
  mutation UpdateEvent($id: String!, $data: EventInput!) {
    updateEvent(id: $id, data: $data) {
      id
      title
      slug
    }
  }
`;

export const DELETE_EVENT = gql`
  mutation DeleteEvent($id: String!) {
    deleteEvent(id: $id) {
      id
    }
  }
`;

export const CREATE_LOCATION = gql`
  mutation CreateLocation($data: LocationInput!) {
    createLocation(data: $data) {
      id
      title
      city
      region
      full_address
      google_maps_url
      latitude
      longitude
    }
  }
`;

export const CREATE_COMMUNITY = gql`
  mutation CreateCommunity($data: CommunityInput!) {
    createCommunity(data: $data) {
      id
      title
      slug
    }
  }
`;

export const CREATE_SPEAKER = gql`
  mutation CreateSpeaker($data: SpeakerInput!) {
    createSpeaker(data: $data) {
      id
      name
    }
  }
`;

export const GET_SPEAKERS = gql`
  query GetSpeakers {
    speakers {
      data {
        id
        name
      }
    }
  }
`;

export const CREATE_TALK = gql`
  mutation CreateTalk($data: TalkInput!) {
    createTalk(data: $data) {
      id
      title
      speakers {
        name
        id
      }
    }
  }
`;

export const UPDATE_TALK = gql`
  mutation UpdateTalk($updateTalkId: String!, $data: TalkInput!) {
    updateTalk(id: $updateTalkId, data: $data) {
      id
      title
      occur_date
      description
      speakers {
        name
        id
      }
    }
  }
`;
