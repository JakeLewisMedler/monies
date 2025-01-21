export default async function ({ redirect, $firebase, $global }) {
  try {
    await $firebase.checkUser();
    if (!$global.user) throw "No user";
  } catch (error) {
    console.error(error);
    redirect("/login");
  }
}
