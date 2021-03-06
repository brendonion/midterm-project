/*
* Front end jQuery stuff
*/

function createResourceElement(resourceData) {
  var { id, title, url, description, topic, creator, date_created } = resourceData;

  // to pass image url to placeholder easier
  var topicIcons = {
        science: `<a href="/resources/${id}"><i class="fa fa-flask" aria-hidden="true"></i></a>`,
        history: `<a href="/resources/${id}"><i class="fa fa-hourglass-end" aria-hidden="true"></i></a>`,
        math: `<a href="/resources/${id}"><i class="fa fa-superscript" aria-hidden="true"></i></a>`,
        geography: `<a href="/resources/${id}"><i class="fa fa-globe" aria-hidden="true"></i></a>`
      };

  var $resource = $('<article>').addClass('card box')
    .append($('<div>').addClass('card-image')
      .append($('<figure>').addClass('image is-2by2')
        .append($(topicIcons[topic]))))
    .append($('<div>').addClass('card-content')
      .append($('<h1>').text(title))
      .append($('<div>').addClass('content')
        .append($('<a class="button is-primary is-outlined">').text('Source').attr('href', url))
        .append($('<strong>').addClass('timestamp').text(moment(date_created).fromNow())
        .append($('<span>').addClass('tag is-dark').text(topic))
        )
      )
    )

  return $resource;
}

function renderResources(resourceObjectofObjects) {
  $('.main-content-wrapper.resources').empty();

  // TODO will have to sort them by date/time
  for (var i in resourceObjectofObjects) {
    var $resource = createResourceElement(resourceObjectofObjects[i]);
    $('.main-content-wrapper.resources').prepend($resource);
  }
  $('.main-content-wrapper.resources').append(
    $('<article>').addClass('card box placeholder')
  );
  $('.main-content-wrapper.resources').append(
    $('<article>').addClass('card box placeholder')
  );
}

$(document).ready(function() {
  /*
  Sends ajax call depending on what page the user is on (All Resources or My Resources)
  and sends the array of topics that are checked.
  */
  function fetchFilteredResources (topicArray, url) {
    $.ajax({
      url: url,
      method: 'GET',
      data: {topic: topicArray}
    }).done(function(results) {
      renderResources(results);
    }).fail(function(err) {
      console.log('Error:', err);
    });
  }

  /*
  Gets an array of all the topics on the filter header that are checked, determines
  which page it's on (All Resources or User Resources) and then calls fetchFilteredResources.
  */
  function handleFilterButtonClick (event) {
    var topicArray = [];
    $.each($('input[name="topic"]:checked'), function() {
      topicArray.push($(this).val());
    });
    if(topicArray.length === 0) {
      topicArray = [null];
    }

    var currentWindow = $(location).attr('pathname');
    if (currentWindow === '/') {
      fetchFilteredResources(topicArray, '/api/resources/filter');
      return;
    } else {
      fetchFilteredResources(topicArray, `/api${currentWindow}/resources/filter`);
      return;
    }
  }

  /*
  Sends ajax call depending on what page the user is on (All Resources or My Resources)
  and sends the search string they entered into the search bar.
  */
  function fetchSearchedResources (searchString, url) {
    $.ajax({
      url: url,
      method: 'GET',
      data: {search: searchString}
    }).done( function(results) {
      renderResources(results);
    }).fail(function(err) {
      console.log('Error:', err);
    });
  }

  //TODO is this working?
  if (isNaN($('#totalRating').text())) {
    $('#totalRating').addClass('NaN');
  }

  function handleRating (url, rating) {
    $.ajax({
        url: url,
        method: 'POST',
        data: {rating: rating}
      }).done(function(results) {
        if (results === 'No Cookie'){
          //TODO update this to flash
          console.log('You need to log in to use this feature');
      } else {
        $('#totalRating').text(results);
        $('#totalRating').removeClass('NaN');
      }
    });
  }

  $('#rating').children().on('click', function(event) {
    var rating = $(this).data('rating');
    var currentWindow = $(location).attr('pathname');
    handleRating(`/api${currentWindow}/rating`, rating);
  });

  function handleLike(url) {
    $.ajax({
        url: url,
        method: 'POST'
      }).done(function(results) {
        if (results === 'added') {
          var likesCount =  $('#like').nextAll('#likesCount');
          var currentCount = likesCount.text();
          var NewCount = (new Number(currentCount) + 1);
          $('#like').text('Unlike');
          likesCount.text(NewCount.toString());
        }
        if (results === 'removed'){
          var likesCount =  $('#like').nextAll('#likesCount');
          var currentCount = likesCount.text();
          var NewCount = (new Number(currentCount) - 1);
          $('#like').text('Like');
          likesCount.text(NewCount.toString());
        }
        if (results === 'No Cookie'){
          //TODO update this to flash
          console.log('You need to log in to use this feature');
      }
    });
  }

  $('#like').on('click', function() {
    var currentWindow = $(location).attr('pathname');
      handleLike(`/api${currentWindow}/like`);
  });

  function submitComment(url, commentBody) {
   if (commentBody.length === 0) {
     $('#warning').html('Too short!').slideDown(300).delay(1600).fadeOut(400);
   } else if (commentBody.length > 255) {
     $('#warning').html('Too long!').slideDown(300).delay(1600).fadeOut(400);
   } else if (commentBody == ' ') {
     $('#warning').html('No blank spaces allowed!').slideDown(300).delay(1600).fadeOut(400);
   } else {
     $.ajax({
       url: url,
       method: 'POST',
       data: {
         text: commentBody
       }
     }).done(function(results) {
       var newComment = $('<article class="comment-content">')
       .append($('<p class="comment-words">').text(commentBody))
       .append($('<h4 class="commenter">').text(results.username))
       .append($('<h4 class="comment-time">').text(results.date));
       $('#comments-container').prepend(newComment);
       $('#comment_form textarea').val('');
     });
   }
 }

$('#comment_form').children('input').on('click', function(event) {
   var currentWindow = $(location).attr('pathname');
   var contents = $('#comment_form textarea').val();
   submitComment(`/api${currentWindow}/comment`, contents);
 });

  /*
  Gets whatever the user typed in the search bar (string), determines which page
  it's on (All Resources or User Resources) and then calls fetchSearchedResources.
  */
  function handleSearchBarKeystroke (event) {
   // If we don't want to search with every keyup, change to 'keypress' and
   // call next function when event.which === 13 (enter key)
   $.each($('input[name="topic"]'), function() {
     $(this).prop('checked', true)
   });

   var searchString = $(this).find('input').val();

   var currentWindow = $(location).attr('pathname');
   if (currentWindow === '/') {
     fetchSearchedResources(searchString, '/api/resources/search');
     return;
   } else {
     fetchSearchedResources(searchString, `/api${currentWindow}/resources/search`);
     return;
   }
  }

  // TODO when filtering, clear search field
  // when someone clicks the 'filter' button on search header
  $('#search-bar').find('#filter-field .button.filter').on('click', handleFilterButtonClick);
  // when someone types in search field on search header
  $('#search-bar #search-field').on('keyup', handleSearchBarKeystroke);

  // when someone clicks the 'select all' button on the filter header
  $('#search-bar').find('#filter-field .button.select-all').on('click', function() {
    $.each($('input[name="topic"]'), function() {
      $(this).prop('checked', true)
    });
  });

  // when someone clicks the 'deselect all' button on the filter header
  $('#search-bar').find('#filter-field .button.deselect-all').on('click', function() {
    $.each($('input[name="topic"]'), function() {
      $(this).prop('checked', false)
    });
  });

  // shows/hides the filter header when someone clicks the 'filter by topic' button
  $('#topic-filter-button').on('click', function() {
    $('#search-bar').slideToggle();
  })

});
