(function($){

    $(document).ready(function($){
        $('.quiz-standart').each(function(){
            Quiz.init(this);
        });
    });

    var Quiz = {
        id: false,
        container: false,
        answers: false,
        results: false,
        cookie_key: false,
        user_answers: {},
        refresh_frequency: 0,
        completed_steps: 0,
        current_step: 0,
        init: function(selector){
            this.container = $(selector);
            this.id = this.container.data('id');
            this.answers = window['quiz_'+this.id].answers;
            this.results = window['quiz_'+this.id].results;
            this.refresh_frequency = window['quiz_'+this.id].refresh_frequency;
            this.responsive();
            this.events();
            this.cookie_key = 'wp_qa_quiz_'+this.id;
            this.cookie_data = JSON.parse(decodeURIComponent(cookie.get(this.cookie_key)));
            this.container.addClass('loaded');

            if(this.refresh_frequency > 0 && this.cookie_data.refreshed == true){
                if(this.cookie_data.current_step > 0){
                    var quiz = this;
                    var new_step = parseInt(this.cookie_data.current_step) + 1;
                    this.current_step = new_step;
                    this.user_answers = this.cookie_data.user_answers;
                    console.log(new_step);
                    quiz.container.find('.questions .question').removeClass('active');
                    quiz.container.find('.questions .question[data-index="'+new_step+'"]').addClass('active');
                    quiz.container.find('.quiz-start').fadeOut(400, function(){
                        quiz.container.find('.questions').fadeIn();
                        quiz.loadImage();
                        $('html, body').animate({
                            scrollTop: quiz.container.offset().top
                        }, 200);
                    });

                }
            }


        },
        events: function(){
            var quiz = this;

            quiz.container.on('click', '.quiz-start > span', function(){
                quiz.start();
            });

            quiz.container.on('click', '.answers ul li[data-key]', function(){
                var question = $(this).data('question');
                var key = $(this).data('key');
                quiz.showAnswer(question, key);
            });

            quiz.container.on('click', '.result span.next', function(){
                quiz.goNext();
            });

            quiz.container.on('click', '.finish span.restart', function(){
                quiz.restart();
            });

            quiz.container.addClass('loaded');

            $( window ).resize(function() {
                quiz.responsive();
            });
        },
        scrollToQuiz: function(){

        },
        responsive: function(){
            var width = this.container.width();
            this.container.removeClass('small medium');
            if(width < 450) this.container.addClass('small');
            if(width < 600) this.container.addClass('medium');
        },
        start: function(){
            var quiz = this;
            quiz.container.find('.quiz-start').fadeOut(400, function(){
                quiz.container.find('.questions').fadeIn();
            });

            $.each(quiz.answers, function(index){
                quiz.user_answers[index] = false;
            });


            quiz.loadImage();

            quiz.current_step++;

            quiz.updateCookie();
        },
        restart: function(){
            var quiz = this;

            quiz.container.find('.questions, .finish, .result').fadeOut(function(){
                quiz.container.find('.questions .question').removeClass('active').attr('style', '');
                quiz.container.find('.questions .question:first').addClass('active');
            });

            quiz.container.find('.quiz-start').fadeIn();

            quiz.completed_steps = 0;
            quiz.current_step = 0;

            cookie.remove(quiz.cookie_key);

        },
        updateCookie: function(){
            var quiz = this;

            quiz.cookie_data = {
                user_answers: quiz.user_answers,
                current_step: quiz.current_step,
                refreshed: false
            };

            cookie.set(quiz.cookie_key, encodeURIComponent(JSON.stringify(quiz.cookie_data)));
        },
        goNext: function(){
            var quiz = this;

            var active = quiz.container.find('.questions .question.active');

            quiz.completed_steps++;
            quiz.current_step++;

            if(quiz.refresh_frequency > 0){
                var left_questions = $(active).nextAll('.question').length;
                if((quiz.completed_steps >= quiz.refresh_frequency) && (left_questions != 0)){
                    quiz.cookie_data.refreshed = true;
                    cookie.set(quiz.cookie_key, encodeURIComponent(JSON.stringify(quiz.cookie_data)));
                    location.href = '';
                    return;
                }
            }


            quiz.container.find('.questions .result').hide();
            var next = active.next('.question');

            if(next.length == 0){
                quiz.finish();
                return;
            }

            active.fadeOut(function(){
                next.fadeIn().addClass('active');
                active.removeClass('active');
                quiz.loadImage();
            });



        },
        loadImage: function(){
            var quiz = this;
            var image_container = quiz.container.find('.question.active .image-wrapper');
            var image = image_container.data('src');
            image_container.html('<img src="'+image+'">');
        },
        finish: function(){
            var quiz = this;

            quiz.container.find('.questions .result').hide();
            quiz.container.find('.questions .question').fadeOut(function(){
                quiz.container.find('.questions .finish').fadeIn();
            });

            quiz.completed_steps = 0;
            quiz.current_step = 0;

            var total = 0;
            var right = 0;
            $.each(quiz.user_answers, function(index){
                total++;
                if(this == 1) right++;
            });

            var score = parseInt((100 / parseInt(total)) * parseInt(right));
            quiz.container.find('.finish .percent span').html(score+'%');

            var scores = [];
            $.each(quiz.results, function(index){
                scores.push(index);
            });

            var closest = quiz.closest(score, scores);
            var finish_data = quiz.results[closest];

            quiz.container.find('.finish .image-wrapper').html(finish_data['image']);
            quiz.container.find('.finish .score_description').html(finish_data['text']);
            quiz.container.find('.question.active').removeClass('active');
            cookie.remove(quiz.cookie_key);
        },
        showAnswer: function(question, key){
            var result = false;
            var name = this.answers[question].name;
            var description = this.answers[question].description;
            var image = this.container.find('.question[data-index="'+question+'"] .image-wrapper img').clone();
            if(this.answers[question].correct == key){
                result = true;
            }
            this.container.find('.result').fadeIn();
            this.container.find('.result .image-wrapper').html(image);
            var info = this.container.find('.result .info');

            info.removeClass('correct incorrect');
            var info_text = '';
            if(result){
                info.addClass('correct');
                info_text += '<h2>Correct!</h2>';

                this.user_answers[question] = 1;
            } else {
                info.addClass('incorrect');
                info_text += '<h2>Incorrect!</h2>';

                this.user_answers[question] = 0;
            }

            info_text += '<b>The correct answer is: "'+name+'"</b><br>';
            info_text += description;

            info.html(info_text);
            this.updateCookie();

        },
        closest: function (num, arr){
            var curr = arr[0];
            var diff = Math.abs (num - curr);
            for (var val = 0; val < arr.length; val++) {
                var newdiff = Math.abs (num - arr[val]);
                if (newdiff < diff) {
                    diff = newdiff;
                    curr = arr[val];
                }
            }
            return curr;
        }
    }

})(jQuery)