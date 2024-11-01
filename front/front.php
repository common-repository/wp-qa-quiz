<?php
class WP_QA_Quiz_Plugin_Front{

    public function __construct(){
        add_shortcode( 'qa-quiz', array($this, 'shortcode') );
    }

    public function shortcode($atts){
        $quiz_id = $atts['id'];
        $post = get_post($quiz_id);
        if(!$post) return '';
        $questions = get_post_meta($post->ID, '_quiz_questions', true);
        $settings  = get_post_meta($post->ID, '_quiz_settings', true);
        $get_results   = get_post_meta($post->ID, '_quiz_results', true);

        if(isset($settings['start_image']) && ($settings['start_image'] != 0)){
            $image = wp_get_attachment_image_src($settings['start_image'], 'full');
            if($image){
                $settings['start_image'] = $image[0];
            }
        } else {
            $settings['start_image'] = false;
        }

        $results = array();
        foreach($get_results as $result){
            $results[$result['score']] = array(
                'image' => wp_get_attachment_image($result['thumbnail_id'], 'full'),
                'text'  => $result['text']
            );
        }

        $answers = array();
        foreach($questions as $index=>$data){
            $answers[$index] = array(
                'correct' => $data['correct'],
                'name'    => $data['variants'][$data['correct']]['answer'],
                'description' => $data['description']
            );
        }

        wp_register_script(
            'js-cookie',
            plugin_dir_url(__FILE__) . 'js/js.cookie.js'
        );

        wp_enqueue_style(
            'qa-quiz-standart',
            plugin_dir_url(__FILE__) . 'css/quiz-standart.css'
        );

        wp_enqueue_script(
            'qa-quiz-standart',
            plugin_dir_url(__FILE__) . 'js/quiz-standart.js',
            array('jquery', 'js-cookie', 'json2')
        );

        wp_localize_script('qa-quiz-standart', 'quiz_'.$post->ID, array(
            'answers' => $answers,
            'results' => $results,
            'settings' => $settings,
            'refresh_frequency' => get_option('wp-qa-quiz-refresh-frequency', 0)
        ));

        ob_start();
        include('templates/quiz-standart.php');
        return ob_get_clean();
    }


}