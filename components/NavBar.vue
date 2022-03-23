<template>
  <div style="display: unset;">
    <nav id="navbar" class="sticky top-0"></nav>
    <div id="fullscreen" @click="toggleMenu" class="fullscreen"></div>
    <div @click="toggleMenu" class="hamburger">
      <div id="line1" class="line"></div>
      <div id="line2" class="line"></div>
      <div id="line3" class="line"></div>
    </div>
    <div class="logos all-initial">
      <a href="https://www.facebook.com/alltidifokus/" class="all-initial">
        <img src="/images/fb.png" alt="facebook" class="logo all-initial">
      </a>
      <a href="https://www.instagram.com/fredrikburmester" class="all-initial">
        <img src="/images/ig.png" alt="instagram" class="logo all-initial">
      </a>
      <a href="https://www.github.com/fredrikburmester" class="all-initial">
        <img src="/images/github.png" alt="github" class="logo all-initial">
      </a>
    </div>
    <div id="menu" class="menu all-initial">
      <ul :style="menuLinkStyle" class="all-initial">
        <li style="display: inline-block"  v-for="menu, i in menuLinks">
          <a :class="linkClass(menu, i)" @click="goTo(menu)">{{menu}}</a>
        </li>
        <!-- <li class="upload">
          <a href="/upload" class="menu-link all-initial">
            Upload
          </a>
        </li> -->
      </ul>
    </div>
  </div>
</template>

<script>
export default {
    name: 'NavBar',
    data () {
        return {
          menuActive: false,
          menuLinks: this.$store.state.albums,
          active: '',
          menuLinkStyle: {
            'display': 'grid',
            'margin-bottom': '20px',
            'text-align': 'left',
            'margin-top': '100px',
            'margin-left': '40px',
            'height': '100vh',
            'grid-template-rows': `repeat(3, 60px) repeat(${this.$store.state.albums.length - 3}, 40px)`,
          }
        }
    },
    created () {
      window.addEventListener('scroll', this.navbarShadow);
    },
    destroyed () {
      window.removeEventListener('scroll', this.navbarShadow);
    },
    mounted() {
      let urlPath = this.$route.path.split('/')[1]
      urlPath = urlPath.replace('%C3%B6', 'ö')
      this.active = urlPath
      
      if($nuxt.$route.path == '/404') {
        //
      }
    },
    methods: {
      linkClass: function (menu, i) {
        return {
          'all-initial': true,
          'menuActive': menu == this.active,
          'large': i < 3
        }
      },
      goTo(menu) {
        this.toggleMenu()
        if (menu != this.active) {
          setTimeout(() => {
              this.$router.push(`/${menu}`)
              this.active = menu
          }, 350)
        }
      },
      navbarShadow() {
          var currentScrollPos = window.pageYOffset;
          if (currentScrollPos >= 10) {
              document.getElementById('navbar').classList.add("navbar-shadow");
          } else {
              document.getElementById("navbar").classList.remove("navbar-shadow");
          }
      },
      toggleMenu() {
        if (!this.menuActive) {
            this.menuActive = true;
            menu.classList.add("active");
            document
                .getElementById("line1")
                .addEventListener("transitionend", this.finishHamburgerAnimation);
            line1.style.transform = "translateY(8px)";
            line3.style.transform = "translateY(-8px)";
            line2.style.opacity = "0";
            fullscreen.style.visibility = "visible";
            fullscreen.style.opacity = "0.7";
        } else {
            this.menuActive = false;
            fullscreen.style.visibility = "hidden";
            fullscreen.style.opacity = "0";
            document
                .getElementById("line1")
                .addEventListener("transitionend", this.finishHamburgerAnimation);
            line1.style.transform += "rotate(-45deg)";
            line3.style.transform += "rotate(45deg)";
            menu.classList.remove("active");
        }
      },
      finishHamburgerAnimation() {
        if (!this.menuActive) {
            line1.removeEventListener("transitionend", this.finishHamburgerAnimation);
            line1.style.transform += "translateY(-8px)";
            line3.style.transform += "translateY(8px)";
            line2.style.opacity = "1";
        } else {
            line1.removeEventListener("transitionend", this.finishHamburgerAnimation);
            line1.style.transform += "rotate(45deg)";
            line3.style.transform += "rotate(-45deg)";
        }
      }
    }
}
</script>

<style>

nav {
  background-color: white;
  height: 90px;
  -webkit-transition: 1s linear;
  -moz-transition: 1s linear;
  -ms-transition: 1s linear;
  -o-transition: 1s linear;
  transition: 1s linear;
  z-index: 1;
}
.menuActive {
  border-bottom: solid rgb(253, 187, 24);
  border-width: 2px;
}
.menu ul {
  list-style-type: none;
}
.menu li {
  padding: 1.1vh 0;
}
.menu a:hover {
  color: #d3d3d3;
  -webkit-transition: all 200ms linear;
  -moz-transition: all 200ms linear;
  -ms-transition: all 200ms linear;
  -o-transition: all 200ms linear;
  transition: all 200ms linear;
}
.menu a {
  display: inline-block;
  font-family: Avenir,Helvetica,Arial,sans-serif;
  font-weight: 700;
  color: #131516;
  text-decoration: none;
  cursor: pointer;
  -webkit-transition: all 300ms linear;
  -moz-transition: all 300ms linear;
  -ms-transition: all 300ms linear;
  -o-transition: all 300ms linear;
  transition: all 300ms linear;
}
.menu hr {
  color: transparent;
  background-color: #000;
  opacity: .05;
  width: 150px;
  margin: 10px 0;
}
.upload {
  margin-top: auto;
}
.navbar-shadow {
  -webkit-box-shadow: 0px 0px 20px -3px rgba(0, 0, 0, 0.4);
  -moz-box-shadow: 0px 0px 20px -3px rgba(0, 0, 0, 0.4);
  box-shadow: 0px 0px 20px -3px rgba(0, 0, 0, 0.4);
}
.hamburger {
  position: fixed;
  top: 0;
  left: 0;
  padding: 33px 40px 33px 40px;
  cursor: pointer;
  z-index: 3;
}

.line {
  background-color: #131516;
  width: 25px;
  height: 3px;
  margin-bottom: 5px;
  -webkit-transition: 170ms linear;
  -moz-transition: 170ms linear;
  -ms-transition: 170ms linear;
  -o-transition: 170ms linear;
  transition: 170ms linear;
}
#line2 {
  width: 20px
}

.logos {
  position: fixed;
  top: 0;
  right: 0;
  margin: 23px 25px 0 0;
  z-index: 2;
}

.logo {
  padding: 10px;
  width: 20px;
  height: auto;
  cursor: pointer;
}

.menu {
  position: fixed;
  top: 0;
  left: -450px;
  z-index: 2;
  background-color: white;
  width: 450px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  -webkit-transition: all 300ms ease-in-out;
  -moz-transition: all 300ms ease-in-out;
  -ms-transition: all 300ms ease-in-out;
  -o-transition: all 300ms ease-in-out;
  transition: all 300ms ease-in-out;
}
.large {
  font-size: 1.7em;
}
.small {
  font-size: 1.1em;
}
.active {
  left: 0;
  -webkit-transition: all 300ms ease;
  -moz-transition: all 300ms ease;
  -ms-transition: all 300ms linear;
  -o-transition: all 300ms ease;
  transition: all 300ms ease;
}
.fullscreen {
  position: fixed;
  visibility: hidden;
  z-index: 1;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  background-color: black;
  opacity: 0.8;
  cursor: pointer;
  -webkit-transition: 300ms linear;
  -moz-transition: 300ms linear;
  -ms-transition: 300ms linear;
  -o-transition: 300ms linear;
  transition: 300ms linear;
}

#title {
  font-family: Open Sans, sans-serif;
  font-size: 100px;
  line-height: 100px;
  font-weight: 400;
  text-align: center;
  letter-spacing: 18px;
  margin-left: 18px;
  margin-bottom: 0;
  color: #131516;
  cursor: pointer;
}

.information a {
  text-decoration: none;
}

#subtitle {
  letter-spacing: 12px;
  font-size: 20px;
  text-align: center;
  text-transform: uppercase;
  font-weight: 200;
  margin: 0 0 0 8px;
  padding: 0;
}

#album-name {
  font-family: Playfair Display, serif;
  font-size: 3em;
  text-align: center;
}

#description {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  font-style: italic;
  color: rgb(117, 117, 117);
  font-size: 20px;
}



.zoom-btn {
  cursor: pointer;
  top: 13px;
  right: 23px;
  position: fixed;
  padding: 20px;
  z-index: 999;
  width: 20px;
  height: 20px;
}

.close-btn {
  position: fixed;
  cursor: pointer;
  top: 13px;
  left: 20px;
  width: 20px;
  height: 20px;
  padding: 20px;
  z-index: 999;
}

.close-btn .line {
  background-color: white;
  width: 25px;
  height: 3px;
  margin-bottom: 5px;
}

#close-line-1 {
  transform: translateY(8px) rotate(45deg);
}

#close-line-2 {
  transform: translateY(-0px) rotate(-45deg);
}

@media only screen and (max-width: 450px) {
  .menu {
      width: 85vw;
      left: -85vw;
  }
  .active {
      left: 0;
  }
  #description {
    font-size: 1.2em;
  }
}
@media only screen and (max-height: 615px) {
  hr {
      visibility: hidden;
  }
  .menu li {
      padding: 0;
      margin: 0;
  }
  .manu ul {
      padding-bottom: 100px;
  }
  .menu {
      overflow-y: auto;
      margin-bottom: 100px;
  }
}

</style>