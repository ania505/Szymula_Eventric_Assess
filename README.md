# Hello Eventric!

Thank you so much for taking the time to review my project and code!

Steps to run the application:

1. First enter `npm install` into your terminal to install any of the packages I used.
2. Enter `npm start` into your terminal. I found that that can cause an error sometimes, so if that happens run `npm install react-scripts` and then `npm start` start again.

I don't have a lot of experience with tests, but because they were mentioned in the last interview round, I tried my hand at a couple of them.
To see them run:

1. Run `npm test` in your terminal.



How to use the application:
- On opening the app, you will see the homepage that has a header and content portion. In the header there is the site title ("Where The Birds Sing"), a filter/sort button,
  and a liked list toggle. Below that there is the content portion that has 2 instances of pagination (top & bottom of page) and a list of bird
  species with a picture, name, and heart button.
- To filter/ sort: Click on the "Filter & Sort By" button. A popup appears, the user makes selections, hits submit, then hits close. The list is now sorted and filtered!
- Use the arrows in the pagination part to go between pages of content.
- To like a bird/ add to your flock click the heart button. That bird's id is saved to localStorage to then be displayed when the user clicks the "View My Flock" button
  in the header.
- If the user clicks on the bird title or picture, the user is taken to the Bird Details page.
- In the detail page, user can click "back" to go back to the list or they can view the bird's species information and where they've been recorded as seen/ heard last. If they like what they see they add or remove that bird from their flock with the heart button.
- Map: The map is moveable and zoomable and interactive! To interact with the map, the user should click on one of the blue location markers. The blue location marker turns red and the information about that bird sighting is listed below the map so the user can see "where the birds sing".

