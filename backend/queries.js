const LOGIN_MUTATION = `
mutation userLogin($id:String!, $name:String!, $img:String!, $email:String!) {
  upsertUser(
    where:{ googleid:$id }
  	create:{
      googleid:$id,
      name:$name,
      email:$email,
      image:$img
    }
    update:{} 
  ) {
    googleid
    name
    email
    image
    groups{
      id
      name
      users {
        name
        email
        image
      }
      code
      hangouts{
        id
        date
        location
        
        committedUsers {
          name
        }
      }
    }
  }
}`

const USER_GROUP_QUERY = `query getUserGroups($id:String) {
  users (where:{googleid:$id}) {
  	groups { id }
  }
}`;

const NEW_GROUP = `mutation newGroup($name: String!, $code: String!, $id: String!) {
  createGroup(
    data: { name: $name, code: $code, users: { connect: { googleid: $id } } }
  ) {
    users {
      googleid
      name
      email
      image
      groups {
        id
        name
        users {
          name
          email
          image
        }
        code
        hangouts {
          id
          date
          location

          committedUsers {
            name
          }
        }
      }
    }
  }
}
`;

const USER_INFO = `
query userInfo($id:String!) {
  users(where:{ googleid:$id }) {
    googleid
    name
    email
    image
    groups{
      id
      name
      users {
        name
        email
        image
      }
      code
      hangouts{
        id
        date
        location
        placeName
        committedUsers {
          name
        }
      }
    }
  }
}`

const CHANGE_GROUP_NAME = `
mutation changeGroupName($id:ID!, $newname:String!) {
  updateGroup(
    where:{id:$id}
    data:{name:$newname}
  ) { name }
}`

const JOIN_GROUP = `
mutation joinGroup($userid:String!, $groupcode:String!) {
  updateGroup(where:{code:$groupcode} data:{users:{
    connect:{googleid:$userid}
  }}) {
    users {
      name
      email
      image
    }
  }
}`

const CREATE_HANGOUT = `
mutation newHangout($groupid:ID!,$location:String!,$time:DateTime!,$name:String!){
  updateGroup(
    where:{id:$groupid}
    data:{
      hangouts:{
        create:{
          location:$location
          date:$time
          placeName:$name
        }
      }
    }
  ) {
    hangouts {
      id
      date
      location
      placeName
      committedUsers {
        name
        googleid
        image
        email
      }
    }
  }
}`

const HANGOUT_INFO = `
query getHangout($id:ID!) {
  hangouts(where:{id:$id}) {
    date
    location
    placeName
    committedUsers {
      name
      googleid
      image
      email
    }
  }
}`

const COMMIT = `
mutation commitUser($userid:String!, $hangoutid:ID!) {
  updateHangout(
    where:{id:$hangoutid}
    data:{
      committedUsers:{
        connect:{googleid:$userid}
      }
    }
  ) {
    id
      date
      location
      placeName
      committedUsers {
        name
        googleid
        image
        email
      }
  }
}`

const DECOMMIT = `
mutation commitUser($userid:String!, $hangoutid:ID!) {
  updateHangout(
    where:{id:$hangoutid}
    data:{
      committedUsers:{
        disconnect:{googleid:$userid}
      }
    }
  ) {
    id
      date
      location
      placeName
      committedUsers {
        name
        googleid
        image
        email
      }
  }
}`

module.exports = {
    LOGIN: LOGIN_MUTATION,
    NEW_GROUP: NEW_GROUP,
    USER_GROUP_QUERY: USER_GROUP_QUERY,
    USER_INFO: USER_INFO,
    CHANGE_GROUP_NAME: CHANGE_GROUP_NAME,
    JOIN_GROUP: JOIN_GROUP,
    CREATE_HANGOUT: CREATE_HANGOUT,
    HANGOUT_INFO: HANGOUT_INFO,
    COMMIT: COMMIT,
    DECOMMIT:DECOMMIT,
}