<template>
  <div style="display: unset">
    <nav id="navbar" class="sticky top-0 bg-base-100"></nav>
    <div id="fullscreen" @click="toggleMenu" class="fullscreen"></div>
    <div @click="toggleMenu" class="hamburger">
      <div id="line1" class="line bg-black dark:bg-white"></div>
      <div id="line2" class="line bg-black dark:bg-white"></div>
      <div id="line3" class="line bg-black dark:bg-white"></div>
    </div>
    <div class="logos flex flex-row">
      <label class="swap swap-rotate">
        <input id="darkmode-switch" @click="toggleDarkMode" type="checkbox" />
        <svg
          class="swap-on fill-current w-6 h-6 dark:text-white"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path
            d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"
          />
        </svg>
        <svg
          class="swap-off fill-current w-6 h-6 dark:text-white"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path
            d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"
          />
        </svg>
      </label>
      <a href="https://www.facebook.com/alltidifokus/">
        <img src="/images/fb.png" alt="facebook" class="logo dark:invert" />
      </a>
      <a href="https://www.instagram.com/fredrikburmester">
        <img src="/images/ig.png" alt="instagram" class="logo dark:invert" />
      </a>
      <a href="https://www.github.com/fredrikburmester">
        <img src="/images/github.png" alt="github" class="logo dark:invert" />
      </a>
    </div>
    <div id="menu" class="menu bg-base-100">
      <ul :style="menuLinkStyle" class="bg-base-100">
        <li style="display: inline-block" v-for="(menu, i) in menuLinks">
          <a :class="linkClass(menu, i)" @click="goTo(menu)">{{ menu }}</a>
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
  name: "NavBar",
  data() {
    return {
      menuActive: false,
      menuLinks: this.$store.state.albums,
      active: "",
      menuLinkStyle: {
        display: "grid",
        "margin-bottom": "20px",
        "text-align": "left",
        "margin-top": "100px",
        "margin-left": "40px",
        height: "100vh",
        "grid-template-rows": `repeat(3, 60px) repeat(${
          this.$store.state.albums.length - 3
        }, 40px)`,
      },
    };
  },
  created() {
    window.addEventListener("scroll", this.navbarShadow);
  },
  destroyed() {
    window.removeEventListener("scroll", this.navbarShadow);
  },
  mounted() {
    let urlPath = this.$route.path.split("/")[1];
    urlPath = urlPath.replace("%C3%B6", "ö");
    this.active = urlPath;

    if (localStorage.getItem("theme") === "dark") {
      document.documentElement.setAttribute("data-theme", "forest");
      document.documentElement.classList.add("dark");
      document.getElementById("darkmode-switch").checked = false;
    } else {
      document.getElementById("darkmode-switch").checked = true;
    }

    if ($nuxt.$route.path == "/404") {
      //
    }
  },
  methods: {
    linkClass: function (menu, i) {
      return {
        menuActive: menu == this.active,
        large: i < 3,
        "dark:text-white": true,
        "hover:text-base-300 dark:hover:text-accent": true,
      };
    },
    goTo(menu) {
      this.toggleMenu();
      if (menu != this.active) {
        setTimeout(() => {
          this.$router.push(`/${menu}`);
          this.active = menu;
        }, 350);
      }
    },
    navbarShadow() {
      var currentScrollPos = window.pageYOffset;
      if (currentScrollPos >= 10) {
        document.getElementById("navbar").classList.add("navbar-shadow");
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
        line1.removeEventListener(
          "transitionend",
          this.finishHamburgerAnimation
        );
        line1.style.transform += "translateY(-8px)";
        line3.style.transform += "translateY(8px)";
        line2.style.opacity = "1";
      } else {
        line1.removeEventListener(
          "transitionend",
          this.finishHamburgerAnimation
        );
        line1.style.transform += "rotate(45deg)";
        line3.style.transform += "rotate(-45deg)";
      }
    },
    toggleDarkMode() {
      if (localStorage.getItem("theme")) {
        if (localStorage.getItem("theme") === "light") {
          document.documentElement.setAttribute("data-theme", "forest");
          document.documentElement.classList.add("dark");
          localStorage.setItem("theme", "dark");
        } else {
          document.documentElement.setAttribute("data-theme", "bumblebee");
          document.documentElement.classList.remove("dark");
          localStorage.setItem("theme", "light");
        }
      } else {
        if (document.documentElement.getAttribute("forest")) {
          document.documentElement.setAttribute("data-theme", "bumblebee");
          document.documentElement.classList.remove("dark");
          localStorage.setItem("theme", "light");
        } else {
          document.documentElement.setAttribute("data-theme", "forest");
          document.documentElement.classList.add("dark");
          localStorage.setItem("theme", "dark");
        }
      }
    },
  },
};
</script>

<style>
nav {
  height: 90px;
  -webkit-transition: 1s linear;
  -moz-transition: 1s linear;
  -ms-transition: 1s linear;
  -o-transition: 1s linear;
  transition: 1s linear;
  z-index: 1;
}
.swap {
  transform: translateX(-7px);
}
.menuActive {
  border-bottom: solid 2px rgb(253, 187, 24);
}
.menu ul {
  list-style-type: none;
}

.menu a {
  display: inline-block;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  -webkit-transition: all 100ms linear;
  -moz-transition: all 100ms linear;
  -ms-transition: all 100ms linear;
  -o-transition: all 100ms linear;
  transition: all 100ms linear;
  padding: 0;
  margin: 0;
}
.menu a:hover {
  background-color: transparent;
}
.menu hr {
  color: transparent;
  background-color: #000;
  opacity: 0.05;
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
  width: 20px;
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
  width: 40px;

  cursor: pointer;
}

.menu {
  position: fixed;
  top: 0;
  left: -450px;
  z-index: 2;
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
  font-size: 1.5em;
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
