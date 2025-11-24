(function($) {
    $(document).ready(function() {
        console.log('Reply form script loaded');
        
        var replyForm = $('#reply_form');
        if (replyForm.length) {
            console.log('Reply form found');
            
            replyForm.on('submit', function(e) {
                console.log('Reply form submit triggered');
                e.preventDefault();
                e.stopPropagation();
                
                var formData = new FormData(this);
                var url = $(this).attr('action');
                
                console.log('Submitting to:', url);
                console.log('Form data:', Object.fromEntries(formData));
                
                $.ajax({
                    url: url,
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function(response) {
                        console.log('Success:', response);
                        location.reload();
                    },
                    error: function(xhr, status, error) {
                        console.error('Error:', error);
                        alert('خطا در ارسال پاسخ: ' + error);
                    }
                });
                
                return false;
            });
        } else {
            console.error('Reply form not found!');
        }
    });
})(django.jQuery);

