<?php
/*
    Plugin Name: WP Q&A Quiz Plugin
    Plugin URI: http://wordplus.org/plugins/wp-qa-quiz/
    Description: Let you create question - answer quiz and insert them with shortcode.
    Version: 1.2
    Author: WordPlus
    Author URI: http://wordplus.org/
*/

require_once('admin/admin.php');
require_once('front/front.php');


class WP_QA_Quiz_Plugin{

    public function __construct(){
        add_action( 'init', array($this, 'plugin_init' ));
        add_action('admin_menu', array($this, 'plugin_menu_entry'));

    }

    public function plugin_init() {
        $args = array(
            'public' => false,
            'show_ui' => true,
            'label'  => 'WP QA Quiz',
            'supports' => array('title')
        );

        register_post_type( 'wp_qa_quiz', $args );
    }

    public function plugin_menu_entry() {
        $page = add_submenu_page(
            'edit.php?post_type=wp_qa_quiz',
            'Settings',
            'Settings',
            'manage_options',
            'wp-qa-quiz-options',
            array($this, 'plugin_option_page'));

        add_action( 'admin_init', array($this, 'register_settings') );
    }

    public function register_settings() {
        register_setting( 'wp-qa-quiz-options', 'wp-qa-quiz-refresh-frequency' );
    }

    public function plugin_option_page(){ ?>
        <div class="wrap">
            <h2>WP Q&A Quiz</h2>
            <form method="post" action="options.php">
                <?php
                settings_fields( 'wp-qa-quiz-options' );
                do_settings_sections( 'wp-qa-quiz-options' );
                ?>
                <table class="form-table">
                    <tr valign="top">
                        <th scope="row">Refresh Frequency</th>
                        <td>
                            <input type="text" name="wp-qa-quiz-refresh-frequency" value="<?php echo esc_attr( get_option('wp-qa-quiz-refresh-frequency', 0) ); ?>" />
                            (set 0 to disable)
                        </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
        </div>
    <?php }

}





$run = new WP_QA_Quiz_Plugin();
$run_admin = new WP_QA_Quiz_Plugin_Admin();
$run_front = new WP_QA_Quiz_Plugin_Front();