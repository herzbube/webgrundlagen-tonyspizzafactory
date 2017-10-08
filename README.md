# Tony's Pizza Factory

This project contains the HTML, CSS and JavaScript code for the fictional website "Tony's Pizza Factory".

The project's purpose is to learn the basics about HTML, CSS and JavaScript so that a website with pure client-side programming can be set up. The project scope and goals are defined by the FFHS course "Web Grundlagen".

# Is this useful for me?

If you != me, then the answer is: Probably not :-) This is purely a personal learning project, which I will keep after the course has finished out of nostalgia.

# Roadmap

The website is developed in 5 sprints, corresponding to the 5 learning blocks of the course:

1. Develop a static website skeleton made up of HTML only
1. Refine the presentation of the (still static) website using CSS
1. Add JavaScript to the mix
1. Connect to a backend service with AJAX and JSON
1. Consume XML documents from the backend and integrate the result into the website

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
* Opening hours and address, on the other hand, should be definitely placed into a `footer` since they are purely ancillary to the main content of the website.
* The remaining part of the main page and the feedback page go into a `section`, because `article` does not fit and `div` is too generic.
* The remaining part of each of the three product pages consists of a sequence of `div`s, all of them nested inside a `section`. In theory, since every available product is presented as a discrete unit one might consider using `article`, but to me the semantics is just not right (a product for purchase is not an article). `section` also doesn't cut it, semantically, because sections need to come together to form a whole - and as I said products form discrete units that do not depend on each other. So in the end, only the generic `div` is the right choice.
* Although it is tempting at first glance, I have decided against using the `time` element to mark up the opening hours in the footer of each page. When you study the HTML5 specs, the `time` element is clearly about specifying a machine-readable date/time (in addition to the human readable one). However, the specs do not support an encoding for weekdays, nor do they support time ranges such as "11 a.m. - 23 p.m.". Instead of time ranges you can specify durations such as "8 hours" but that's not useful for specifying opening hours. Also see [this StackOverflow post](https://stackoverflow.com/a/32539617/1054378). What I could do is, add a separate `time` element for every start and end time, but I don't see how this would be useful - it certainly doesn't express the semantic meaning of "opening hours on a specific weekday". If I had to deal with this in more detail, I would investigate the [OpeningHoursSpecification](http://schema.org/OpeningHoursSpecification) microdata scheme.

# Development

I keep the files of this project under source control using git. Check out the project home on GitHub: https://github.com/herzbube/webgrundlagen-tonyspizzafactory

I'm working on Mac OS X. The tools that I am using are:

* WebStorm, a JetBrains product that I'm allowed to use for free under an educational license. Thanks.
* git on the command line
* TextWrangler, a free-to-use text editor
* Firefox and Safari (this being a web programming project, this browser list probably should be longer 😇)
* My trusted wiki to keep notes about learning [HTML](https://wiki.herzbube.ch/index.php/LearningHTML), [CSS](https://wiki.herzbube.ch/index.php/LearningCSS) and [JavaScript](https://wiki.herzbube.ch/index.php/LearningJavaScript). **Note**: If you want to access the wiki without annoying security warnings from your browser, you can install the [CAcert root certificates](http://www.cacert.org/index.php?id=3) in your browser's trust store.

# Useful commands

To create a zip archive from the current git HEAD for submission, use the following command:

    git archive --format=zip --prefix=WebG-Projekt1-studentname/ HEAD >WebG-Projekt1-studentname.zip