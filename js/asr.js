// Pause method
function restore(){
  $("#record, #live").removeClass("disabled");
  $("#pause").replaceWith('<a class="button one" id="pause">Pause</a>');
  $(".one").addClass("disabled");
  Fr.voice.stop();
}
// Process
function makeWaveform(){
  var analyser = Fr.voice.recorder.analyser;
	console.log(analyser);
  var bufferLength = analyser.frequencyBinCount;
  var dataArray = new Uint8Array(bufferLength);
}
//Process Start Button
$(document).ready(function(){
  $(document).on("mousedown", "#record:not(.disabled)", function(){
	  console.log("ASR REC START");
    setLoder();
	  $("#record").addClass("base64");
	  Fr.voice.record($("#live").is(":checked"), function(){
      $(".recordButton").addClass("disabled");

      $("#live").addClass("disabled");
      $(".one").removeClass("disabled");

      makeWaveform();
    });
  });

  $(document).on("click", "#recordFor5:not(.disabled)", function(){
    Fr.voice.record($("#live").is(":checked"), function(){
      $(".recordButton").addClass("disabled");

      $("#live").addClass("disabled");
      $(".one").removeClass("disabled");

      makeWaveform();
    });

    Fr.voice.stopRecordingAfter(5000, function(){
      alert("Recording stopped after 5 seconds");
    });
  });

  $(document).on("click", "#pause:not(.disabled)", function(){
    if($(this).hasClass("resume")){
      Fr.voice.resume();
      $(this).replaceWith('<a class="button one" id="pause">Pause</a>');
    }else{
      Fr.voice.pause();
      $(this).replaceWith('<a class="button one resume" id="pause">Resume</a>');
    }
  });

  $(document).on("click", "#stop:not(.disabled)", function(){
    restore();
  });

  $(document).on("click", "#play:not(.disabled)", function(){
    if($(this).parent().data("type") === "mp3"){
      Fr.voice.exportMP3(function(url){
        $("#audio").attr("src", url);
        $("#audio")[0].play();
      }, "URL");
    }else{
      Fr.voice.export(function(url){
        $("#audio").attr("src", url);
        $("#audio")[0].play();
      }, "URL");
    }
    restore();
  });

  $(document).on("click", "#download:not(.disabled)", function(){
    if($(this).parent().data("type") === "mp3"){
      Fr.voice.exportMP3(function(url){
        $("<a href='" + url + "' download='MyRecording.mp3'></a>")[0].click();
      }, "URL");
    }else{
      Fr.voice.export(function(url){
        $("<a href='" + url + "' download='MyRecording.wav'></a>")[0].click();
      }, "URL");
    }
    restore();
  });

  $(document).on("mouseup", "#record:not(.disabled)", function(){	 
    console.log("ASR START");
    resetLoader();
      Fr.voice.export(function(url){
        console.log("Here is the base64 URL : " + url);
		getText(url);

      }, "base64");
    restore();
  });

  $(document).on("click", "#save:not(.disabled)", function(){
    function upload(blob){
      var formData = new FormData();
      formData.append('file', blob);

      $.ajax({
        url: "upload.php",
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function(url) {
          $("#audio").attr("src", url);
          $("#audio")[0].play();
          alert("Saved In Server. See audio element's src for URL");
        }
      });
    }
    if($(this).parent().data("type") === "mp3"){
      Fr.voice.exportMP3(upload, "blob");
    }else{
      Fr.voice.export(upload, "blob");
    }
    restore();
  });
});

// ASR ENG Process
var countArray = ["0"];
var y = 1;
function getText(base64Text) {	
$("#loader").css("display", "block");
$('.asr-btn-record').prop('disabled',true);

var start_time = new Date().getTime();
	var language = $("input[name='language']:checked").val();
	var url="https://apis.sentient.io/microservices/voice/asr/v0.1/getpredictions";
	if(language==1){
		url="https://apis.sentient.io/microservices/voice/asrsch/v0.1/getpredictions";
	}
	
	var lastItem = countArray.pop();
	var x = parseInt(lastItem);
	// Calling ASR ENG api
	 $.ajax({
		method: 'POST',	
		headers:{'x-api-key':apiKey},
		contentType: 'application/json',
		url: url,
		data: JSON.stringify({"audio" : base64Text, "language" : language}),
		timeout: 80000,
		success: function(res){
			// response
			var count = parseInt(x + y);
			countArray.push(count);
			var request_time = new Date().getTime() - start_time;
			$('#voice_ouputs').append("<div class='outputcontainerblue'><span class='count'>"+countArray+"</span><p>"+res.text+"</p><span class='time-right'>"+request_time+"</span></div>");
			$('#voice_ouputs').scrollTop(25000);
			$("#loader").css("display", "none");
			$('.asr-btn-record').prop('disabled',false);
		},
		error:function(err){
			var request_time = new Date().getTime() - start_time;
			$('#voice_ouputs').append("<div class='outputcontainerblue'><p>"+err.text+"</p><span class='time-right'>"+request_time+" ms</span></div>");
		  $("#loader").css("display", "none");			
		  $('.asr-btn-record').prop('disabled',false);
			
		}		
	});	 
}
// Clear text method
function clearAll() {
	$("#disableDiv").css("display", "none");
}

// Loader method
function setLoder() {
  $("#record").removeClass("base64");
  $('.asr-btn-record').css('display','none');
  $('.asr-btn-disable').css('display','flex');
}

// Reset Loader
function resetLoader(){
 $('.asr-btn-record').css('display','flex');
 $('.asr-btn-disable').css('display','none');
}