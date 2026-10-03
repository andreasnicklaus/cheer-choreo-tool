# Cheer Choreo Tool - End-User FAQ

> **About this resource:** the answers below describe the **web app UI**, not the MCP tools.
> Most of them describe clicking, dragging and menu navigation that you cannot perform over
> MCP. Read this only when the user asks about app features, the editor workflow,
> countsheets, exports, or troubleshooting. For anything you can act on directly, use the
> `guide`, `hits` and `lineups` resources instead.

Paths written as `/contact` or `/datenschutz` are routes inside the web app. They are not
reachable over MCP - do not attempt to open them.

**Source of truth:** `app/src/i18n/en.json` (`faq.*`). Keep this file in sync when the FAQ changes.

## General

### Who is the choreo planner for?

The choreo planner is for **coaches of cheerleading teams**. The end products (countsheets, pictures and videos) should be shared to the teams in order to make the learning of the choreos easier.

### What is the choreo planner?

The choreo planner is a **free** project that is developed for cheerleaders. The choreo planner should make it possible to create choreos and share them with others. The choreo planner should make it possible to simplify and digitize the planning of choreos. Above all, it should be possible to teach the participants in a simplified manner. The end products (countsheets, pictures and videos) are to be distributed to the teams in order to make the learning of the choreos faster. This will make your team a **digital team**. This means that you no longer have to work your team with notes and pens, but become one of the pioneers of the digital world.

### How do I create my first choreo?

The choreo planner is built in four steps: **club**, **team**, **season**, **choreo**.

1. Create your club and give it a name - optionally add your club logo.
2. Create a team in your club.
3. Start a season for that team and fill the season roster.
4. Add a choreo to the season and open the editor.

On the start page you can also use the **filters** to find choreos by name, team, season and length.

### How do I log in? Can I use Google, GitHub or Facebook?

You have three options:

- **Register** with a username and a password
- **Log in** with **Google**, **GitHub** or **Facebook**
- **Reset your password** if you have forgotten it

You will find the registration on the start page. One thing to note: if you register with a social login provider, you will log in with that provider from then on - there is no separate password for it.

### Can I install the choreo planner as an app?

Yes! The choreo planner can be installed on your desktop or mobile device. Depending on your browser you will find an **Install** button, or you can use the **Install app** entry in your browser's menu. The app does not occupy any storage space on your device and makes it easier to start the application.

### Why can the server be offline?

The choreo planner is a **free** project. Therefore, the servers may not always be reached. We have prepared a list of reasons why you cannot reach the servers:

1. The servers are serviced by us. In this case you can't do anything except to wait and hope that we are finished quickly. If you would like to know when the servers can be reached again, you are welcome to send us an email to [info@choreo-planer.de](mailto:info@choreo-planer.de) or a DM on Instagram an [@choreoplaner](https://www.instagram.com/choreoplaner/).
2. Our internet connection failed. Since there is no budget available to insure a fail-safe internet connection, it can happen that our internet connection fails. In this case you can't do anything except to wait and hope that we are finished quickly. If you would like to know when the servers can be reached again, you are welcome to send us an email to [info@choreo-planer.de](mailto:info@choreo-planer.de) or a DM on Instagram an [@choreoplaner](https://www.instagram.com/choreoplaner/).
3. Your internet connection has failed. If you have already loaded our website, you can charge the website again without an internet connection, but you cannot charge new data. In this case, you can try to restore your internet connection. If you need help, you can't write us email, because you have no internet.

If you would like to support the choreo planner, you can support us by participating in project development or making a donation. We have not yet prepared a way for that, but we are working on it. If you would like to support us, you are welcome to send us an email to [info@choreo-planer.de](mailto:info@choreo-planer.de) or a DM on Instagram an [@choreoplaner](https://www.instagram.com/choreoplaner/).

## Features

### Can I request features?

**Yes!** We look forward to any features that we can incorporate into the choreo planner. If you wish for a feature, please feel free to send us an email to [info@choreo-planer.de](mailto:info@choreo-planer.de) or a DM on Instagram an [@choreoplaner](https://www.instagram.com/choreoplaner/). We will then consider whether we can implement this feature. If we do, we will of course inform you about it.

### How many teams can I manage?

In a nutshell: as many you want! It is possible to create any number of clubs, teams, season, choreos and participants.

### Do I have to create a new team for every season?

No! You can easily start a new season with your existing team and set up the squad. You can even take participants from other seasons or even other teams to the new season.

### How do I manage my roster and participants?

You manage your roster in two places:

- In the **Team** tab of your choreo you decide who stands on the mat, and you can **substitute** participants in and out while you are choreographing - perfect for last-minute changes.
- On your **team page** you maintain the roster of a season. For each participant you can create, edit and delete a **name**, a **nickname** and an **abbreviation**. The nickname is what you use in the editor, the abbreviation keeps your countsheets short.

### Can I import members from another team or season?

Yes, so you do not have to enter everyone again:

- When you **start a new season**, you can take over the roster of an existing season.
- On your **team page** you can import participants from any other team or season of your clubs.

You can adjust the imported data afterwards and, of course, remove anyone who is not there this season.

### Can I manage several clubs and add our logo?

Yes! Go to your account settings and open the **Club** tab. There you can:

- Create **several clubs** and switch between them with the **active club**
- Upload the **logo** of your club

Your logo then appears on your exported **countsheets** and as a **watermark on your videos**. This way your PDFs and videos look like your club's - and not like somebody else's choreo.

### Can I work with others?

Yes, you can! Go to your account settings and open the **Access** tab. Click **Add user**, enter their email address and pick a role. They will get an invitation and need to accept it before they can see your data.

**Here is what each role can do:**

- **Coach** can view, edit and delete your choreos
- **Assistant** can view and edit your choreos
- **Athlete** can view your choreos

You can change their role or revoke access at any time.

### Can I use AI to help me create my choreos?

Yes! The Choreo Planner supports **MCP** (Model Context Protocol), which allows AI assistants like Claude, Cursor, and others to connect directly to your choreos. To set it up, go to your **Account** settings and open the **Danger zone** tab. Click **Configure** under **AI Access** to generate a token and get the configuration you need for your AI tool.

## The editor

### How do I build a formation (lineup)?

Every participant of your roster gets a marker that you drag onto the mat. As soon as you place a participant, a lineup is created automatically - if a lineup already exists on this count, the participant is simply added to it. A lineup always lasts **one count**, so you move to the next count to create the next formation.

**Two settings make this easier:**

- **Align positions horizontally and vertically** snaps your markers into straight rows and columns.
- **Move the count along while editing** jumps to the next count as soon as you are done with the current one, so you can build a whole choreo without jumping back and forth.

If a lineup does not apply to everyone, you need several groups on the same count. Remove the affected participants from the lineup in the list, click **Add a lineup**, select the second group and drag its markers to their positions.

### How do I navigate between counts and eights?

You navigate with the buttons above the mat: **Previous count**, **Next count**, **Previous eight**, **Next eight**, **Jump to start** and **Jump to end**.

An **eight** consists of eight counts, so the eight buttons are the fastest way to travel through a long choreo. The current count is always displayed, and with **Move the count along while editing** the editor can switch counts automatically while you build.

### Can I play back my choreo?

Yes! Click **Play/Pause** or press the **spacebar** and your choreo is played back animated across the counts. This is the fastest way to check whether your transitions and your counts work.

If the playback is too fast to follow, you can slow it down. And if you work faster than the app can save, it warns you that updates might not be saved in the right order.

### What are position proposals?

Position proposals save you a lot of dragging. Based on the movement of your participants and the lines you have already created, the choreo planner suggests a lineup for the next count.

You are then asked whether you want to use the proposed lineup - you can **accept** it or **reject** it. If you do not want to be asked again, choose **Reject and disable** to switch the proposals off. You can switch them back on in the editor at any time.

### How do I change the length of my choreo or the mat layout?

Both are changed in your **choreo settings**:

- **Length**: adjust the number of counts and eights to fit your routine.
- **Mat layout**: choose between cheerleading mat, **Garde**, **Stage (3:4)** and **Stage (1:1)**. The layout determines the shape of your mat, so pick the one that matches your performance area.

Your lineups keep their positions on the mat, so you can change the layout without losing your choreography.

### How do I assign a color to a participant?

Open the **Team** tab in your choreo. In the table of participants you can set an individual **color** for each of them. The color is then used on the mat and in your exports, which makes lineups with many people much easier to read and lets you see at a glance who belongs to which group.

### Are there keyboard shortcuts?

Yes, the editor comes with a keyboard tutorial. The most important shortcuts are:

| Shortcut                              | Action         |
| ------------------------------------- | -------------- |
| **Arrow left**                        | Previous count |
| **Arrow right**                       | Next count     |
| **Arrow up**                          | Previous eight |
| **Arrow down**                        | Next eight     |
| **Space**                             | Play/Pause     |
| **H** or **N**                        | New entry      |
| **Ä**                                 | Edit entry     |
| **Double-click** on a countsheet cell | New entry      |

On English keyboards **Ä** is the quote key. You find the full tutorial in the editor via **How-To**.

## Hits & countsheets

### How do I add a hit or stunt?

An entry - your hit or stunt - is defined by the **count** it happens on, a **name** and the **participants** it applies to.

1. Jump to the count where the hit happens.
2. Click **Add count entry**, press **H** or **N**, or double-click the cell in the countsheet.
3. Give the entry a name and choose who it applies to. By default, the entry is created on the current count.

You can assign an entry to everyone, to nobody, or to any selection of your participants. If you are not sure who it applies to, you can fill that in later - you will find all entries in the list next to the lineups.

### What is the countsheet view?

The countsheet shows all entries of your choreo at a glance. Every entry is defined by a **count**, a **name** and the **participants** it applies to. You find all of them in the list next to the lineups.

- A **double-click on a countsheet cell** creates a new entry on that count.
- Click the **edit icon** next to an entry, or press **Ä** on your keyboard, to change it.

The countsheet is not only a list - it is what you hand out to your team. Because each entry knows who it applies to, you can later generate a personal countsheet for every single participant.

## Exporting

### How do I export a countsheet as a PDF?

In your choreo, open the menu at the top right and select **Generate countsheet**. Before you download it, you can decide what goes on it:

- Show the **date**, the **team name** and the **choreo name**
- Show the **names of the participants**
- Show the **logo of your club**
- Choose **who the countsheet is for**

That last point is the interesting one: if you select individual participants, you get a personal countsheet for each of them, showing only their entries. If you select everyone, the names are left out to save space. The countsheet is split over several pages automatically if it gets too long.

### How do I create a video of my choreo?

In your choreo, open the menu at the top right and select **Export video**. Before you start, you can choose:

- The **format**: MP4 or WebM
- Whether the video shows a **running count**, your **team name** and the **choreo name**
- Whether your **club logo** is added to it
- **Who appears on the video**: everyone, nobody, or only selected participants

Then click **Generate the video**. It is created **locally in your browser**, so it takes as long as your device needs and no choreo data leaves your device during the export. Afterwards you can download it and share it in your team chat.

## Solving problems

### How can I report problems?

The best way is our [contact form](/contact) - just describe your problem there and we will get back to you. Alternatively you can write us an email to [info@choreo-planer.de](mailto:info@choreo-planer.de) or send a DM on Instagram to [@choreoplaner](https://www.instagram.com/choreoplaner/).

### I accidentally deleted something. Can I undo that?

Yes, but not yourself! You can contact us at any time. Then the following data can be restored:

- User accounts
- Clubs
- Teams
- Seasons
- Choreos
- Rosters

Please describe in your contact by email to [info@choreo-planer.de](mailto:info@choreo-planer.de) or as a DM on Instagram an [@choreoplaner](https://www.instagram.com/choreoplaner/) the date and the time of deletion so that we can quickly solve your problem.

### Why is creating the video so slow?

Your video is generated **locally in your browser**, so the speed depends on your device - a long choreo with many participants can take a while. To make it faster, you can:

- Choose only the **participants** you actually need instead of all of them
- Shorten the choreo, or export only the section you need
- Close other applications and browser tabs while the video is created

If the video does not play smoothly afterwards, that has the same cause: the quality depends on the performance of your device. If the video cannot be played at all, please [let us know](/contact).

## Data protection

### Data protection

Please read about data protection in our [data protection declaration](/datenschutz).

### Are my data passed on to third parties?

**No!** For us there is no reason to pass on your data to third parties. Protecting the personal data of your team members, especially minors, is very important to us. Therefore, your data will not be passed on to third parties. Please read about data protection in our [data protection declaration](/datenschutz).
