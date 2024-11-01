<div class="quiz-standart" data-id="<?php echo $post->ID; ?>">
    <div class="quiz-start" style="<?php if($settings['start_image']) echo 'background-image: url('.$settings['start_image'].')'; ?>">
        <span>Start</span>
    </div>
    <div class="questions">
        <div class="result" style="display: none">
            <div class="correct-answer">
                <div class="image-wrapper"></div>
                <div class="info"></div>
            </div>
            <span class="next"></span>
        </div>
        <div class="finish" style="display:none;">
            <h2>You finished the quiz!</h2>
            <h3>QUIZ: <?php echo $post->post_title; ?></h3>
            <div class="score">
                <div class="image-wrapper"></div>
                <div class="percent">Your score: <span>10%  </span></div>
                <div class="score_description"></div>
            </div>
            <div class="actions">
                <a href="https://www.facebook.com/sharer/sharer.php?u=<?php echo urlencode(get_the_permalink()); ?>"
                   class="facebook"
                   onclick="javascript:window.open(this.href, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');return false;"
                   target="_blank" title="Share on Facebook">
                    Share on Facebook
                </a>
                <span class="restart">Restart Quiz</span>
            </div>
        </div>
        <?php foreach($questions as $index=>$question){ $i++; ?>
        <div class="question <?php if($i==1) echo 'active'; ?>" data-index="<?php echo $index; ?>" style="display: none">
            <?php if($question['thumbnail_id'] != 0){
                $thumb = wp_get_attachment_image_src($question['thumbnail_id'], 'full'); ?>
                <div class="image-wrapper" data-src="<?php echo $thumb[0]; ?>"></div>
            <?php } ?>
            <div class="title"><?php
                if(!empty($question['title'])){
                    echo $question['title'];
                } else {
                    echo $post->post_title;
                } ?></div>
            <div class="answers">
                <ul>
                    <?php foreach($question['variants'] as $i=>$variant){ ?>
                        <li data-key="<?php echo $i; ?>" data-question="<?php echo $index; ?>"><?php echo $variant['answer']; ?></li>
                    <?php } ?>
                </ul>
            </div>
        </div>
        <?php } ?>
    </div>

</div>