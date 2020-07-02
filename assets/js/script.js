var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};
//stores new task to local
var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

//listens for a click events on "p" elements delegated to a parent
//ul with class .list-group-this is because the list item won't even exist
//when the p click happens, so we have to have it look for the parent
//which will exist
$(".list-group").on("click", "p", function() {
  //this method will get the inner text 
  //content of the current element, $(this)
  var text = $(this)
    .text()
    //removes any extra white space
    .trim();
  //Scheduler!-generating the new task dynamically
  //$("textarea") tells jQuery to find all existing <textarea> elements, 
  //whereas, $("<textarea>") tells jQuery to create a new <textarea> element.
  //the <textarea> element is now saved in the variable textInput, 
  var textInput = $("<textarea>")
  .addClass("form-control")
  .val(text);

  //textInput is only a dom object up till now, we need to 
  //append to the page and be able to print it, so we replace
  //the existing <p> element, $(this), with the new <textarea>, textInput
  $(this).replaceWith(textInput);
  //Scheduler-now Clicking on a <p> element should turn it into a <textarea>
  
  //focus here automatically highlights the text box and gets it ready for input
  //its easier on the user
  textInput.trigger("focus");

});

// update and save the task

/* use blur when the focus is taken off the text area 
this will auto save the task*/

/*Scheduler!-here were using blur instead of a save button
but with scheduler I think we want to use the save method-will
have to look up how to do that-actually, i could still use blur
and have the lock button essentially be a fake button because
they will have to activate blur, just by interacting with the 
lock button*/
$(".list-group").on("blur", "textarea", function(){

  // Scheduler!-This blur event will trigger as soon as the user interacts 
  //with anything other than the <textarea> element. When that 
  //happens, we need to collect a few pieces of data: the 
  //current value of the element, the parent element's ID, and
  // the element's position in the list. These data points will 
  //help us update the correct task in the tasks object.

  // get the textarea's current value/text
var text = $(this)
  .val()
  .trim();

// get the parent ul's id attribute
var status = $(this)
//find closest object with this class, ie figure out which of the 
//4 list columns this object is being added to
  .closest(".list-group")
//returning the id of the item described above, "list-in-review," for example
  .attr("id")
  //We're then chaining that to .replace() to remove "list-" from the text, which will give us the category name (e.g., "toDo") that will match one of the arrays on the tasks object (e.g., tasks.toDo)
  .replace("list-", "");

// get the task's position in the list of other li elements
var index = $(this)
  .closest(".list-group-item")
  .index();

  //Because we don't know the values, we'll have to use the 
  //variable names as placeholders. Underneath the three 
  //variables, add the following lines:. Returns the text 
  //property of the object at the given index.
  tasks[status][index].text = text;

  //call saveTasks and save to localstorage immediately
saveTasks();

// recreate p element after storing task to localstorage
var taskP = $("<p>")
  .addClass("m-1")
  .text(text);

// replace textarea with p element
$(this).replaceWith(taskP);

});


// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  // select the form <input> element with an id of modalDueDate using jQuery
   var taskDate = $("#modalDueDate").datepicker({minDate: 1});
  

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();

// due date was clicked
$(".list-group").on("click", "span", function() {
  // get current text
  var date = $(this)
    .text()
    .trim();

  // create new input element
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);

  // swap out elements
  $(this).replaceWith(dateInput);

  //begin addition
   // enable jquery ui datepicker
   dateInput.datepicker({
    minDate: 1
  });
  //end addition

  // automatically focus on new element
  dateInput.trigger("focus");
});

// value of due date was changed
$(".list-group").on("blur", "input[type='text']", function() {
  // get current text
  var date = $(this)
    .val()
    .trim();

  // get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // update task in array and re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();

  // recreate span element with bootstrap classes
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

  // replace input with span element
  $(this).replaceWith(taskSpan);
});

//turning columns into sortables
//sortable method
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event) {
    console.log("activate", this);
  },
  deactivate: function(event) {
    console.log("deactivate", this);
  },
  over: function(event) {
    console.log("over", event.target);
  },
  out: function(event) {
    console.log("out", event.target);
  },
  //update method
  update: function(event) {
 // declare a new array before loop to store the task data in
var tempArr = [];

// loop over current set of children in sortable list
$(this).children().each(function() {
  var text = $(this)
    .find("p")
    .text()
    .trim();

  var date = $(this)
    .find("span")
    .text()
    .trim();

  // add task data to the temp array as an object
  tempArr.push({
    text: text,
    date: date
  });
});

console.log(tempArr);

// trim down list's ID to match object property
var arrName = $(this)
  .attr("id")
  .replace("list-", "");

// update array on tasks object and save
tasks[arrName] = tempArr;
saveTasks();
  }
});

$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    ui.draggable.remove();
    console.log("drop");
  },
  over: function(event, ui) {
    console.log("over");
  },
  out: function(event, ui) {
    console.log("out");
  }
});

