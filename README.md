# fredrik.studio

A new version of my photography website, this time made with Nuxt. ⛰️

The point of this version of the website is to create a edge hosted version, completely relying on modern solutions from [Cloudflare](https://www.cloudflare.com/) and [Firebase](https://firebase.google.com/).

## 🚀 Website

| Branch      | Environment | URL                        |
| ----------- | ----------- | -------------------------- |
| main        | prod        | https://dev.fredrik.studio |
| development | dev         |                            |

## Images

Like in my [other photography website](https://github.com/fredrikburmester/fredrikburmester-express), image loading is a top priority. That's why this time i've tried to decentralize and use Cloudflare to deliver my photos.

### ☁️ Cloudflare

Images are stored and loaded from Cloudflare Images. Images are loaded in different variants depending on the use case.

### 🔥 Firebase

To keep track of which images belong to which album a firebase firestore is used.

### 🐌 Lazy loading

Since this website utilizes cloudflares optimized images I'll be relying entirely on the native `loading="lazy"` for this website.
