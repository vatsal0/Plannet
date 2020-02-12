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
        
        committedUsers {
          name
        }
      }
    }
  }
}`

module.exports = {
    LOGIN: LOGIN_MUTATION,
    NEW_GROUP: NEW_GROUP,
    USER_GROUP_QUERY: USER_GROUP_QUERY,
    USER_INFO: USER_INFO
}