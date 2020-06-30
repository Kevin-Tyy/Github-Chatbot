$(document).ready(function(){
    $('#delete').on('click',function(e){
        var prompt=confirm('Are you sure ??')
        if(prompt){
            $target=$(e.target)
         const id =$target.attr('data-id')

        $.ajax({
            type:'delete',
            url:'account/delete/'+id,
            success:function(response){
                window.location.href='/Login'
                alert('Account deleted')
            },
            error:function(err){
                console.log(err)
            }
        })
        }
    })
})