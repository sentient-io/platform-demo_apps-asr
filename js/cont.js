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
	
	Fr.voice.export(function(url){
	  $("<audio src='"+ url +"'></audio>").appendTo("body");
	  $("body audio:last")[0].play();
	}, "URL");
}
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

  $(document).on("touchstart", "#record:not(.disabled)", function () {
      console.log("touchstart");
      console.log("ASR REC START");
      setLoder();
      $("#record").addClass("base64");
      Fr.voice.record($("#live").is(":checked"), function () {
          $(".recordButton").addClass("disabled");

          $("#live").addClass("disabled");
          $(".one").removeClass("disabled");

          makeWaveform();
      });
  });
  $(document).on("touchend", "#record:not(.disabled)", function () {
      console.log("touchend");
      console.log("ASR START");
      resetLoader();

      var language = $("input[name='language']:checked").val();
      console.log(" language : " + language);
      if (language == 0) {
          Fr.voice.export(function (blob) {
              console.log(blob);
              getEngText(blob);
          }, "blob");
      } if (language == 1) {
          Fr.voice.export(function (url) {
              console.log("Here is the base64 URL : " + url);
              getChiText(url);
          }, "base64");
      }
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

    $(document).on("mouseup", "#record:not(.disabled)", function () {
    console.log("ASR START");
    resetLoader();
	
	var language = $("input[name='language']:checked").val();
	console.log(" language : "+language);
	if(language == 0){
		Fr.voice.export(function(blob){
			console.log(blob);
			getEngText(blob);
		}, "blob");
	}if(language == 1){
		Fr.voice.export(function(url){
			console.log("Here is the base64 URL : " + url);
			getChiText(url);
		  }, "base64");
	} 
    restore();
  });
});

function wait(ms) {
    var start = new Date().getTime();
    var end = start;
    while (end < start + ms) {
        end = new Date().getTime();
    }
}

var countArray = ["0"];
var y = 1;
function getEngText(blob) {	
console.log("ENG");
$("#loader").css("display", "block");
$('.asr-btn-record').prop('disabled',true);

var start_time = new Date().getTime();
var lastItem = countArray.pop();
var x = parseInt(lastItem);
	
	var language = $("input[name='language']:checked").val();
	if(language==0){
		  var formData = new FormData();
		  formData.append('filePath', blob),
		  formData.append('samplerate', 16000),
		  formData.append('channel', 1);

			for (var pair of formData.entries()) {
				console.log("formData Console : " + pair[0]+ ': ' + pair[1]);
			}
		
		  $.ajax({
			url: "https://apis.sentient.io/microservices/utility/audioprocessing/v0.1/getresults",
			method: 'POST',
			headers:{'x-api-key':apiKey},
			data: formData,
			contentType: false,
			processData: false,
			success: function(res) {
				$.ajax({
                    url: "https://apis.sentient.io/microservices/voice/asr/v0.1/getpredictions",
					method: 'POST',
					headers:{'x-api-key':apiKey},
					contentType: 'application/json',
					data: JSON.stringify({"model" : "news_parliament", "wav_base64" : res.results.AudioContent, "file_type" : "wav", "vad_threshold": 0.4}),
					processData: false,
					success: function(resp) {
                        console.log("resp : " + JSON.stringify(resp));
						for (var index in resp) {
                            console.log(resp[index]);
							var count = parseInt(x + y);
							countArray.push(count);
							console.log("ajaxCounter" + countArray);
                            var request_time = new Date().getTime() - start_time;
                            texttodisplay=""
                            if (resp.results) {
                                var i;
                                for (i = 0; i < resp.results.length; i++) {
                                    texttodisplay += resp.results[i].text;
                                }
                                
                            }
                            console.log(texttodisplay);
                            $('#voice_ouputs').append("<div class='outputcontainerblue'><span class='count'>" + countArray + "</span><p>" + texttodisplay +"</p><span class='time-right'>"+request_time+" ms</span></div>");
							$('#voice_ouputs').scrollTop(25000);
							$("#loader").css("display", "none");
							$('.asr-btn-record').prop('disabled',false);
						}
					},
					error:function(err){
						var count = parseInt(x + y);
							countArray.push(count);
							console.log("ajaxCounter" + countArray);
						var request_time = new Date().getTime() - start_time;
						$('#voice_ouputs').append("<div class='outputcontainerblue'><span class='count'>"+countArray+"</span><p>"+err.text+"</p><span class='time-right'>"+request_time+" ms</span></div>");
						//$("#disableDiv").css("display", "none");
						//$("#recordDiv").css('display','block');	
					  $("#loader").css("display", "none");			
					  $('.asr-btn-record').prop('disabled',false);

					}	
				  });
			}
		  });
	}
}

function getChiText(base64Text) {	
console.log("CHI");
$("#loader").css("display", "block");
$('.asr-btn-record').prop('disabled',true);

var start_time = new Date().getTime();
var lastItem = countArray.pop();
	var x = parseInt(lastItem);
	
	var language = $("input[name='language']:checked").val();
	if(language==1){
		var url="https://apis.sentient.io/microservices/voice/asrsch/v0.1/getpredictions";
		$.ajax({
		method: 'POST',	
		headers:{'x-api-key':apiKey},
		contentType: 'application/json',
		url: url,
		data: JSON.stringify({"audio" : base64Text, "language" : language}),
		timeout: 80000,
		success: function(res){
			console.log("res" + res);
			var count = parseInt(x + y);
			countArray.push(count);
			console.log("ajaxCounter" + countArray);
			var request_time = new Date().getTime() - start_time;
			//$('#voice_ouputs').append("<div class='outputcontainerblue'><p>"+res.text+"</p><span class='time-right'>"+request_time+" ms</span></div>");
			$('#voice_ouputs').append("<div class='outputcontainerblue'><span class='count'>"+countArray+"</span><p>"+res.message+"</p><span class='time-right'>"+request_time+"</span></div>");
			$('#voice_ouputs').scrollTop(25000);
				//$("#disableDiv").css("display", "none");
				//$("#recordDiv").css("display", "block");
        $("#loader").css("display", "none");
        $('.asr-btn-record').prop('disabled',false);
		},
		error:function(err){
			var count = parseInt(x + y);
			countArray.push(count);
			console.log("ajaxCounter" + countArray);
			var request_time = new Date().getTime() - start_time;
			$('#voice_ouputs').append("<div class='outputcontainerblue'><span class='count'>"+countArray+"</span><p>"+err.message+"</p><span class='time-right'>"+request_time+" ms</span></div>");
			//$("#disableDiv").css("display", "none");
			//$("#recordDiv").css('display','block');	
      $("#loader").css("display", "none");			
      $('.asr-btn-record').prop('disabled',false);
			
		}		
	});	
	}
}

function clearAll() {
	$("#disableDiv").css("display", "none");
}

function setLoder() {
	$("#record").removeClass("base64");
  $('.asr-btn-record').css('display','none');
  $('.asr-btn-disable').css('display','flex');
}

function resetLoader(){
 $('.asr-btn-record').css('display','flex');
 $('.asr-btn-disable').css('display','none');
}
