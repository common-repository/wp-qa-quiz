<?php
class WP_QA_Quiz_Plugin_Admin{

    public function __construct(){

        add_action('edit_form_after_title', array($this, 'quiz_editor'));

        add_action( 'admin_print_scripts-post-new.php', array($this, 'add_js_css'), 11 );
        add_action( 'admin_print_scripts-post.php', array($this, 'add_js_css'), 11 );
        add_action( 'wp_ajax_wp_qa_quiz', array($this, 'admin_ajax'), 11 );

        add_action( 'save_post', array($this, 'saving_quiz_data'), 10, 2 );
    }

    public function quiz_editor($post){
        if($post->post_type != 'wp_qa_quiz') return;
        include_once('templates/questions.html');
    }

    public function admin_ajax(){
        $action = $_REQUEST['a'];

        switch($action){
            case 'get_image':
                $image_id = intval($_REQUEST['image_id']);
                wp_send_json($this->get_image_src($image_id));
                break;
        }

        die();
    }

    public function get_image_src($image_id){
        return wp_get_attachment_image_src($image_id, array(150, 150));
    }

    public function saving_quiz_data($post_id, $post){
        if($post->post_type != 'wp_qa_quiz') return;
        if(!current_user_can('edit_post', $post_id)) return;

        if(isset($_POST['answers']) && is_array($_POST['answers']) && !empty($_POST['answers'])){
            update_post_meta($post_id, '_quiz_questions', $_POST['answers']);
        }

        if(isset($_POST['results']) && is_array($_POST['results']) && !empty($_POST['results'])){
            update_post_meta($post_id, '_quiz_results', $_POST['results']);
        }

        if(isset($_POST['settings']) && is_array($_POST['settings']) && !empty($_POST['settings'])){
            update_post_meta($post_id, '_quiz_settings', $_POST['settings']);
        }
    }

    public function add_js_css(){
        global $post_type, $post;

        if($post_type == 'wp_qa_quiz') {

            $script_vars = array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'noimage'  => plugin_dir_url(__FILE__) . 'img/noimage.png',
                'post_id'  => $post->ID
            );

            ob_start();
            include('templates/question.html');
            $script_vars['templates']['answer'] = ob_get_clean();

            ob_start();
            include('templates/variant.html');
            $script_vars['templates']['variant'] = ob_get_clean();

            ob_start();
            include('templates/result.html');
            $script_vars['templates']['result'] = ob_get_clean();

            ob_start();
            include('templates/settings.html');
            $script_vars['templates']['settings'] = ob_get_clean();

            $script_vars['questions'] = get_post_meta($post->ID, '_quiz_questions', true);
            $script_vars['results']   = get_post_meta($post->ID, '_quiz_results', true);
            $script_vars['settings']   = get_post_meta($post->ID, '_quiz_settings', true);

            #$script_vars['settings']['start_image'] = 636;
            /*$script_vars['results'][2] = array(
                'score' => 50,
                'text'    => 'Nice try',
                'thumbnail_id' => 593
            );


            $script_vars['questions'][2] = array(
                'thumbnail_id' => 59,
                'description'  => 'Description 2',
                'correct'      => 2,
                'variants'     => array(
                    1 => array(
                        'answer' => 'Answer 1'
                    ),
                    2 => array(
                        'answer' => 'Answer 2'
                    )
                )
            ); */

            wp_register_script(
                'qa-quiz-admin',
                plugin_dir_url(__FILE__) . 'js/editor.js',
                array('jquery')
            );

            wp_localize_script( 'qa-quiz-admin', 'quiz', $script_vars );
            wp_enqueue_script('qa-quiz-admin');

            wp_enqueue_style(
                'qa-quiz-admin',
                plugin_dir_url(__FILE__) . 'css/editor.css'
            );

            wp_enqueue_media();

        }
    }

}