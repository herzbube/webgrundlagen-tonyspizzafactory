# Tony's Pizza Factory

This project contains the HTML, CSS and JavaScript code for the fictional website "Tony's Pizza Factory".

The project's purpose is to learn the basics about HTML, CSS and JavaScript so that a website with pure client-side programming can be set up. The project scope and goals are defined by the FFHS course "Web Grundlagen".

# Is this useful for me?

If you != me, then the answer is: Probably not :-) This is purely a personal learning project, which I will keep after the course has finished out of nostalgia.

# Roadmap

The website is developed in 5 steps, corresponding to the 5 learning blocks of the course:

* Static website skeleton made up of HTML only
* Refine the presentation of the (still static) website using CSS
* Add JavaScript to the mix
* Connect to a backend service with AJAX and JSON
* Consume XML documents from the backend and integrate the result into the website

# Website structure

```
Website root
+-- Pizza
+-- Salad
+-- Soft drinks
+-- Feedback
```

# Design decisions

* The wireframe design suggests that the site navigation appears at the top of a page, so it was tempting to place the `nav` element inside a `header` element. I decided against it because placing the navigation in a specific spot is a question of presentation and should thus be answered by CSS. Example: Would it still make sense to have the navigation in a `header` if the CSS were to hide the navigation in a popup menu?