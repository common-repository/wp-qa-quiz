(function($){

    $(document).ready(function(){

        $('h1.nav-tab-wrapper').on('click', 'a.nav-tab', function(event){
            event.preventDefault();

            var link = $(this);
            var selector = link.attr('href');
            link.parent().find('a.nav-tab').removeClass('nav-tab-active');
            link.addClass('nav-tab-active');

            $(this).parent().parent().find('> div:not(.quiz-info)').hide();
            $(this).parent().parent().find(selector).show();
        });

        $('#shortcode-copy').val($('#shortcode-copy').val().split('{{post_id}}').join(quiz.post_id));

        Questions.init();
        Results.init();
        Settings.init();

    });

    var Settings = {
        selectors: {
            container: 'div.settings',
        },
        templates: quiz.templates,
        settings:   quiz.settings,
        frame: false,
        initData: {
            start_image: 0
        },
        init: function(){
            this.container = $(this.selectors.container);
            if(this.settings == '') this.settings = this.initData;
            this.render(this.settings);
            this.events();
        },
        render: function (data) {
            var quiz = this;
            var template = quiz.templates.settings;
            $.each(data, function(index){
                template = Settings.replaceVal(template, index, this);
            });

            quiz.container.html(template);

            quiz.container.find('.row').each(function(){
                quiz.initImage($(this));
            });

        },
        events: function(){

            this.container.on('click', '.thumb', function(event){
                event.preventDefault();
                var image = $(this);
                var frame = Questions.frame;
                // If the media frame already exists, reopen it.
                if ( frame ) {
                    frame.open();
                    return;
                }

                frame = wp.media({
                    title: 'Select or Upload Media',
                    button: {
                        text: 'Use this media'
                    },
                    multiple: false
                });

                // When an image is selected in the media frame...
                frame.on( 'select', function() {
                    var attachment = frame.state().get('selection').first().toJSON();

                    console.log(attachment);
                    image.html( '<img src="'+attachment.sizes.thumbnail.url+'" alt="" height="'+attachment.sizes.thumbnail.height+'" width="'+attachment.sizes.thumbnail.width+'" />' );
                    image.data('id', attachment.id );
                    image.next('input').val( attachment.id );
                    image.removeClass('noimage');
                });

                frame.open();

            });

        },
        replaceVal: function(string, key, value){
            if(typeof value == 'undefined') value = '';
            return string.split('{{'+key+'}}').join(value);
        },
        initImage: function(row){
            var image = row.find('.thumb');
            var image_id = image.data('id');
            if(image_id == 0) {
                image.addClass('noimage');
                return;
            }
            $.post(quiz.ajax_url, {
                'action'   : 'wp_qa_quiz',
                'a'        : 'get_image',
                'image_id' : image_id
            }, function(data){
                if(data != false){
                    image.html('<img src="'+data[0]+'" width="150px" height="150px">')
                } else {
                    image.addClass('noimage');
                }
            });
        }
    };

    var Results = {
        selectors: {
            container: 'div.results',
        },
        templates: quiz.templates,
        results:   quiz.results,
        frame: false,
        initData: {
            score: 100,
            text:  '',
            thumbnail_id: 0
        },
        init: function(){
            this.container = $(this.selectors.container);
            this.render(this.results);
            this.events();
        },
        render: function (data) {
            if(data == ''){
                Results.newResult(this.initData, 1);
                return;
            }

            $.each(data, function(key, data){
                Results.newResult(data, key);
            });
        },
        newResult: function(data, index){
            var template = Results.templates.result;

            if(typeof index != 'undefined'){
                var number = index;
            } else {
                var number = $(this.container).find('.result').length + 1;;
            }

            template = Results.replaceVal(template, 'number', number);
            template = Results.replaceVal(template, 'thumbnail_id', data.thumbnail_id);
            template = Results.replaceVal(template, 'text', data.text);
            template = Results.replaceVal(template, 'score', data.score);

            var question = $(template).appendTo(Results.container);

            Results.initImage(question);
        },
        replaceVal: function(string, key, value){
            if(typeof value == 'undefined') value = '';
            return string.split('{{'+key+'}}').join(value);
        },
        events: function(){
            this.container.on('click', '.result button.delete', function(event){
                event.preventDefault();
                $(this).parentsUntil('.results', 'div.result').remove();
            });

            this.container.on('click', '.result button.add', function(event){
                event.preventDefault();
                Results.newResult(Results.initData);
            });

            this.container.on('click', '.thumb', function(event){
                event.preventDefault();
                var image = $(this);
                var frame = Questions.frame;
                // If the media frame already exists, reopen it.
                if ( frame ) {
                    frame.open();
                    return;
                }

                frame = wp.media({
                    title: 'Select or Upload Media',
                    button: {
                        text: 'Use this media'
                    },
                    multiple: false
                });

                // When an image is selected in the media frame...
                frame.on( 'select', function() {
                    var attachment = frame.state().get('selection').first().toJSON();

                    image.html( '<img src="'+attachment.url+'" alt=""/>' );
                    image.data('id', attachment.id );
                    image.next('input').val( attachment.id );
                    image.removeClass('noimage');
                });

                frame.open();

            });
        },
        initImage: function(answer){
            var image = answer.find('.thumb');
            var image_id = image.data('id');
            if(image_id == 0) {
                image.addClass('noimage');
                return;
            }
            $.post(quiz.ajax_url, {
                'action'   : 'wp_qa_quiz',
                'a'        : 'get_image',
                'image_id' : image_id
            }, function(data){
                if(data != false){
                    image.html('<img src="'+data[0]+'" width="150px" height="150px">')
                } else {
                    image.addClass('noimage');
                }
            });
        }

    };

    var Questions = {
        selectors: {
            container: 'div.questions'
        },
        templates: quiz.templates,
        questions: quiz.questions,
        frame: false,
        initData: {
            thumbnail_id: 0,
            description:  '',
            variants: {
                1: {
                    answer: ''
                }
            }
        },
        init: function(){
            this.container = $(this.selectors.container);
            this.render(this.questions);
            this.events();
        },
        render: function (questions) {
            if(questions == ''){
                Questions.newQuestion(this.initData, 1);
                return;
            }

            $.each(questions, function(key, data){
                Questions.newQuestion(data, key);
            });
        },
        events: function(){

            this.container.on('click', '.variants span.delete', function(event){
                event.preventDefault();
                var variant =  $(this).parentsUntil('tbody', 'tr.variant');
                var container = $(this).parentsUntil('table', 'tbody');
                var question = $(this).parentsUntil('.questions', 'div.question');

                $(this).parent().parent().remove();
                Questions.reindexVariants(container);
                Questions.generateSelects(question);
            });

            this.container.on('click', 'button.add-variant', function(event){
               event.preventDefault();
               var answer = $(this).parentsUntil('.questions');
               var variants = $(answer).find('.variants tbody');
               Questions.newVariant(variants);
            });

            this.container.on('click', 'button.add-question', function(event){
                event.preventDefault();
                Questions.newQuestion(Questions.initData);
            });

            this.container.on('click', 'button.delete-question', function(event){
                event.preventDefault();
                var question = $(this).parentsUntil('.questions', 'div.question');
                question.remove();

            });

            this.container.on('change', '.variant input[type="text"]', function(event){
                event.preventDefault();
                Questions.generateSelects($(this).parentsUntil('.questions', 'div.question'));
            });


            this.container.on('click', '.thumb', function(event){
                event.preventDefault();
                var image = $(this);
                var frame = Questions.frame;
                // If the media frame already exists, reopen it.
                if ( frame ) {
                    frame.open();
                    return;
                }

                frame = wp.media({
                    title: 'Select or Upload Media',
                    button: {
                        text: 'Use this media'
                    },
                    multiple: false
                });

                // When an image is selected in the media frame...
                frame.on( 'select', function() {
                    var attachment = frame.state().get('selection').first().toJSON();

                    image.html( '<img src="'+attachment.url+'" alt=""/>' );
                    image.data('id', attachment.id );
                    image.next('input').val( attachment.id );
                    image.removeClass('noimage');
                });

                frame.open();

            });



        },
        newQuestion: function(data, index){
            var template = Questions.templates.answer;

            if(typeof index != 'undefined'){
                var number = index;
            } else {
                var number = $(this.container).find('.question').length + 1;;
            }
            template = Questions.replaceVal(template, 'number', number);
            template = Questions.replaceVal(template, 'description', data.description);
            template = Questions.replaceVal(template, 'thumbnail_id', data.thumbnail_id);
            template = Questions.replaceVal(template, 'title', data.title);


            var question = $(template).appendTo(Questions.container);
            var variants = $(question).find('.variants tbody');

            $.each(data.variants, function(key, data){
                var answer = Questions.templates.variant;
                answer = Questions.replaceVal(answer, 'index', key);
                data['number'] = number;

                $.each(data, function(key, value){
                    answer = Questions.replaceVal(answer, key, value);
                });

                $(variants).append(answer);
            });

            Questions.generateSelects(question, data.correct);
            Questions.initImage(question);
        },
        reindexVariants: function(container){
            var number = 0;
            $(container).find('tr').each(function(){
                number++;
                $(this).attr('data-index', number);
                $(this).find('.num').html(number);
            });
        },
        newVariant: function(container){
            var index = $(container).find('.variant').length + 1;
            var answer = Questions.templates.variant;
            var number = $(container).parentsUntil('.questions', 'div.question').data('number');
            answer = Questions.replaceVal(answer, 'index', index);
            answer = Questions.replaceVal(answer, 'number', number);
            answer = answer.replace(/({{[\S]*}})/ig, '');
            $(answer).appendTo(container);
        },
        generateSelects: function(question, selected){
            var select = question.find('select.correct');
            if(typeof selected == 'undefined'){
                var selected = select.val();
            } else {
                var selected = selected;
            }


            var variants = {};
            question.find('.variants .variant').each(function(){
                var index = parseInt($(this).find('.num').html());
                var value = $(this).find('input[type="text"]').val();
                variants[index] = value;
            });

            select.html('');

            $.each(variants, function(key, value){
                if(value != '') {
                    select.append('<option value="' + key + '">' + value + '</option>');
                }
            });

            select.val(selected);
        },
        replaceVal: function(string, key, value){
            if(typeof value == 'undefined') value = '';
            return string.split('{{'+key+'}}').join(value);
        },
        initImage: function(answer){
            var image = answer.find('.thumb');
            var image_id = image.data('id');
            $.post(quiz.ajax_url, {
              'action'   : 'wp_qa_quiz',
              'a'        : 'get_image',
              'image_id' : image_id
            }, function(data){
                if(data != false){
                    image.html('<img src="'+data[0]+'" width="150px" height="150px">')
                } else {
                    image.addClass('noimage');
                }
            });
        }
    };

})(jQuery)