<template>
  <div class="login">
    <h1>Login</h1>
    <div class="inputs">
      <b-form-input v-model="user.email" placeholder="Email Address"></b-form-input>
      <b-form-input type="password" v-model="user.password" placeholder="Password"></b-form-input>
    </div>
    <div class="buttons">
      <b-button variant="primary" @click="login">Login</b-button>
    </div>
  </div>
</template>

<script>
export default {
  layout: "public",
  data() {
    return {
      user: {
        email: "",
        password: ""
      },
      forgot: false
    };
  },
  methods: {
    async login() {
      try {
        console.log("Login");
        await this.$firebase.login(this.user);

        this.$router.push("/");
      } catch (err) {
        this.$swal({
          icon: "error",
          title: "Auth Error",
          text: err.message
        });
        console.error("Error Logging In", err);
      }
    },
    async sendMagicLink() {
      try {
        await this.$axios.post(`/users/magiclink?email=${this.user.email.toLowerCase()}`);

        this.$swal
          .fire({
            icon: "success",
            title: "Sent",
            text: "Your magic Link has been sent, check your mailbox"
          })
          .then(() => {
            this.forgot = false;
          });
        console.log("Magic link sent");
      } catch (error) {
        console.error(error);
        this.$swal.fire({
          icon: "error",
          title: "Error",
          text: error
        });
      }
    },
    async sendTempPass() {
      try {
        await this.$axios.post(`/users/temppass?email=${this.user.email.toLowerCase()}`);
      } catch (error) {
        this.$swal({
          icon: "error",
          title: "Error sending temporary password"
        });
      }
      this.$swal({
        icon: "success",
        title: "Sent",
        text: `Please check your emails for your new temporary login details`
      }).then(() => {
        this.forgot = false;
      });
    }
  }
};
</script>
<style lang="scss">
.login {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
}
</style>
