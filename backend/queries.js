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
}