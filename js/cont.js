function restore(){
  $("#record, #live").removeClass("disabled");
  $("#pause").replaceWith('<a class="button one" id="pause">Pause</a>');
  $(".one").addClass("disabled");
  Fr.voice.stop();
}

function makeWaveform(){
  var analyser = Fr.voice.recorder.analyser;

  var bufferLength = analyser.frequencyBinCount;
  var dataArray = new Uint8Array(bufferLength);

 
}
$(document).ready(function(){
  $(document).on("mousedown", "#record:not(.disabled)", function(){
	  console.log("ASR REC START");

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
	  setLoder();
		console.log("ASR START");
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


function getText(base64Text) {	
$("#loader").css("display", "block");

var start_time = new Date().getTime();
	var language = $("input[name='language']:checked").val();
	var url="https://api.sentient.io/asr/prod/asreng";
	if(language==1){
		url="https://api.sentient.io/asr/prod/asrsch";
	}
	
	 $.ajax({
		method: 'POST',	
		headers:{'x-api-key':apiKey},
		contentType: 'application/json',
		url: url,
		data: JSON.stringify({"audio" : base64Text, "language" : language}),
		timeout: 80000,
	  
		success: function(res){
			var request_time = new Date().getTime() - start_time;
			$('#voice_ouputs').append("<div class='outputcontainerblue'><p>"+res.text+"</p><span class='time-right'>"+request_time+" ms</span></div>");
			$('#voice_ouputs').scrollTop(25000);
						$("#disableDiv").css("display", "none");
				$("#recordDiv").css("display", "block");
				$("#loader").css("display", "none");
		},
		error:function(err){
			var request_time = new Date().getTime() - start_time;
			$('#voice_ouputs').append("<div class='outputcontainerblue'><p>"+err.text+"</p><span class='time-right'>"+request_time+" ms</span></div>");
			$("#disableDiv").css("display", "none");
			$("#recordDiv").css('display','block');	
			$("#loader").css("display", "none");			
			
		}
		
	});	 
}

function clearAll() {
	$("#disableDiv").css("display", "none");
}

function setLoder() {
	$("#record").removeClass("base64");
	$("#recordDiv").css('display','none');
	$("#disableDiv").css("display", "block");
}

