# Contributing to Tiny-slider
Thanks for considering contributing to Tiny-slider. :tada: :clap:   
With the help of contributors like you, Tiny-slider will work better for everyone.   

### Why this project?
Tiny-slider was strongly inspired by [Owl Carousel](https://owlcarousel2.github.io/OwlCarousel2/) which is a very powerful and awesome tool to make a slide show. But I don't want to include jQuery just for a slider (Do you?), that's why I started this project. Right now Tiny-slider is still young and may have some issues and lack some features. We can work together to make it much more useful for the whole community.   

### Features needed:  
- [ ] automate test  
- [ ] custom build (build Tiny-slider based on your needs)
- [ ] modular

## How can I contribute?

### Fire an issue
We can't test Tiny-slider on every browser and device. There are always some edge cases in which tiny-slider may not run properly. Fire an issue when it doesn't work for you. This not only helps you,  also prevent others from facing the same issue.  
**Notes for firing issues:**   
- Before you fire an issue, make sure you update to the latest version of each main version. (e.g. v2.8.7 for version 2)   
- Provide the OS and browser version.
- Provide a link or your plugin options.

### Request missing features
It's those who use tiny-slider shape the future of this project. If there is one missing part which you really need in your project, let us know and we will try to add it.

### Submit a pull request
If you know what's wrong or missing and willing to help :heart: :clap: :+1:, follow the following steps:
- Open your command line tool, go to the target directory, clone this project with `git clone git@github.com:ganlanyuan/tiny-slider.git` command.
- Install Docker ([Mac](https://store.docker.com/editions/community/docker-ce-desktop-mac), [Windows](https://store.docker.com/editions/community/docker-ce-desktop-windows)) and run.
- Pull the required image with `docker pull cmcdev/web` in the command line tool.
- Run `docker-compose up` in the command line tool after located in the cloned directory.
- Make changes in "src/tiny-slider.js", "src/tiny-slider.helper.ie8.js" or "src/tiny-slider.scss" and a series of tasks will automatically run to minify, compile source files to final js and CSS files.
- Test the project with "http://localhost:3000/tests/tests.html".
- Turn down Docker with `docker-compose down -v` following command + C (Mac).   

NOTE: If you don't want to get complicated, just make changes to "src/tiny-slider.js", "src/tiny-slider.helper.ie8.js" or "src/tiny-slider.scss" and send a pull request.
