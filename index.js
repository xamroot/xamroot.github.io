console.log("WORKS!");

const getPosts = async () => {
  let postsuri = "https://raw.githubusercontent.com/xamroot/xamroot.github.io/main/posts.json";
  fetch(postsuri)
    .then(res=>{return res.json()})
    .then(res=>console.log(res));
}

await getPosts();
