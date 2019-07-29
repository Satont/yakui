<template>
  <div class="modal fade bd-example-modal-lg" :id="id" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Information about types of cooldowns</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="alert alert-warning" role="alert">
            When command fired, then command will set on cooldown.
          </div>  
          <div class="row">
            <div class="col-sm-6">
              <div class="alert alert-success" role="alert">
                <h4 class="alert-heading">Execute</h4>
                <p>Response of command will be sended in user whispers</p>
              </div>
            </div>
            <div class="col-sm-6">
              <div class="alert alert-danger" role="alert">
                <h4 class="alert-heading">No execute</h4>
                <p>Command just will be not runned</p>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  props: ['id']
}
</script>
