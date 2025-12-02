<div align="center">
<img src="app/public/Icon.png/" width="200" height="200" alt="Choreo Planer Icon">

# Choreo Planer

![License](https://img.shields.io/github/license/andreasnicklaus/cheer-choreo-tool?style=for-the-badge)
![Status](https://img.shields.io/badge/In_Development-ffb02e?style=for-the-badge&logo=checkmarx&logoColor=white&label=status)

![Server Version](https://img.shields.io/github/package-json/v/andreasnicklaus/cheer-choreo-tool?filename=server%2Fpackage.json&style=for-the-badge&label=Server%20Version)
![Website Version](https://img.shields.io/github/package-json/v/andreasnicklaus/cheer-choreo-tool?filename=app%2Fpackage.json&style=for-the-badge&label=Website%20Version)

![Website status](https://img.shields.io/website?url=https%3A%2F%2Fwww.choreo-planer.de&style=for-the-badge)
![Backend status](https://img.shields.io/website?url=https%3A%2F%2Fapi.choreo-planer.de&style=for-the-badge&label=Backend)

![Backend server build status](<https://img.shields.io/github/actions/workflow/status/andreasnicklaus/cheer-choreo-tool/docker-server-image.yml?style=for-the-badge&logo=docker&logoColor=white&label=Backend%20Build%20(Server)>)
![Frontend build status](https://img.shields.io/github/actions/workflow/status/andreasnicklaus/cheer-choreo-tool/pages.yml?style=for-the-badge&logo=githubactions&logoColor=white&label=Frontend%20Build)

![Last commit](https://img.shields.io/github/last-commit/andreasnicklaus/cheer-choreo-tool?style=for-the-badge&label=Last%20Major%20Update)
![Top languages](https://img.shields.io/github/languages/top/andreasnicklaus/cheer-choreo-tool?style=for-the-badge)
![Language count](https://img.shields.io/github/languages/count/andreasnicklaus/cheer-choreo-tool?style=for-the-badge)

`Planning tool for choreographies in cheerleading and dance`

</div>

## :iphone: Socials

[![](https://img.shields.io/badge/Follow%20on%20Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/choreoplaner)

[![](https://img.shields.io/badge/Follow%20on%20Facebook-1877F2?style=for-the-badge&logo=facebook&logoColor=white)](https://www.facebook.com/choreoplaner/)

[![](https://img.shields.io/badge/Visit%20www.choreo--planer.de-orange?style=for-the-badge&logo=googlechrome&logoColor=white)](https://www.choreo-planer.de)

## Architecture

```mermaid
graph

  subgraph Github
    subgraph pages[Github Pages]
      subgraph vue[Vue JS UI]
        VueMatomo
        bootstrap-vue
        vue-18n
        vue-meta
      end
    end
    githubactions(Github Actions)
  end



  subgraph On-Premise
    Router --port forwarding--> ReverseProxy
    subgraph HomeServer
      subgraph Docker
        ReverseProxy
        Matomo
        Watchtower
        ReverseProxy[Reverse Proxy]
        sequelize
        db[(Postgres Database)]
        dba[(Analytics Database)]
        subgraph api[Choreo Planer API]
          sequelize
          i18n
          winston
          nodemailer
        end
      end
    end
  end

  ReverseProxy --> api
  ReverseProxy --> Watchtower
  ReverseProxy --> Matomo

  sequelize --> db
  Matomo --> dba

  VueMatomo --IPv4/IPv6,https--> aws

  User --IPv4/IPv6,https--> aws(AWS EC2 as Reverse Proxy)
  User --IPv4/IPv6,https--> pages
  aws --IPv6,https--> Router

  BetterStack --IPv4/Ipv6--> aws
  BetterStack --IPv4/IPv6,https--> pages

  githubactions --update docker images--> dockerhub([Docker Hub])
  githubactions --update UI--> pages
  githubactions --trigger watchtower update--> aws

  Watchtower --fetch image versions--> dockerhub

  nodemailer --https---> GoogleMail(Google Mail)
  mailProxy(DNS provider) --forward emails to *@choreo-planer.de--> GoogleMail
  GoogleMail --send emails as *@choreo-planer.de--> Brevo(Brevo)
```

## :+1: Collaborators

- [Andreas Nicklaus](https://github.com/andreasnicklaus) <br/> [![](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/andreasnicklaus/) [![](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/andreasnicklaus) [![](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://www.instagram.com/andreasnicklaus)

## :scroll: License

See [LICENSE](LICENSE) for the license of this project.

## :sparkles: Version history

### 0.11.2 - 2025-12-02

- Added ability to control the video length by time rather than BPS
- Added help section for video exports
- Error handling for faulty mp4 video codec
- Error handling for stuck page load
- Increased security by updating dependencies and fixing vulnerabilities

### 0.11.1 - 2025-10-16

- Log ingestion for better observability
- Switched to Typescript and added documentation
- UI Testing: added unit tests and integration test to ensure a acceptable user experience on most common browsers
- Backend Testing: added unit tests to ensure that services are compatible with the implementation of the REST server

### 0.11.0 - 2025-05-09 (alias: 0.10.3)

- New mat variants
  - Square without license
  - Flat rectangle (1:2) for guard dance or similar
  - Boxy rectangle (3:4) for regular theater stages
- Improved on user experience by adding a "last logged in" field to track the last time a user was seen
- Added a "new feature" badge to increase visibility

### 0.10.2 - 2025-05-03

- Added notification service with increased interactivity for users
- Localization of Server Messages and Pages for English :gb: and German :de:

### 0.10.1 - 2025-04-12

- Enhanced user settings on profile page
- SSO for "forgot password" function
- Personalization through profile pictures and club logos

### 0.10.0 - 2025-03-25

- Added internationalization for English and German
- Added security best practices for backend server (security headers, rate limiting)
- Minor UI improvements
- Implemented fuzzy search and created links in admin dashboard

### 0.9.8 - 2025-01-08

- Fixed issues with mobile UI
- Added structured data for improved SEO
- Removed mailproxy and moved mail configuration to backend server

### 0.9.7 - 2025-01-08

- Added icon variants for holiday seasons
- Added server availability status information
- Fixed loading issues for new teams
- Added admin panel for application overview

### 0.9.6 - 2024-12-05

- Added feedback option
- Fixed spelling errors

### 0.9.5 - 2024-11-29

- Improved usability by adding feedback messages for email confirmation and app installation prompt

### 0.9.4 - 2024-11-28

- Support for mobile devices
- Added email address to user profile used for logging in
- Added mailserver configuration for sending emails to admins and users
- Added social links to github and instagram
- Fixed display error of dot size on the choreo mat

### 0.9.3 - 2024-11-16

- Added support for installing the app from the browser
- Added impressum, data protection declaration and open graph meta tags
- Fixed errors on team creation and prerendering

### 0.9.2 - 2024-11-14

- Improved performance by prerendering public pages
- Added Meta tags for improved search engine visibility

### 0.9.1 - 2024-11-12

- Fixed errors on server build
- Added sitemap for search engine visibility

### 0.9.0 - 2024-11-11

- Implemented animations in editing view
- Added video and PDF download option
- Added keyboard shortcuts for quick editing
- Improved account management by adding account page
- Project version is visible in footer
