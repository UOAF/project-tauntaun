function send_save_mission() {
    data = {
      key: "save_mission",
      value: ""
    };
    update_ws.send(JSON.stringify(data));
}

let app = new Vue({
    el: '#app',
    data: {
    },
    methods: {
      saveMission: function () {
        send_save_mission();
      }
    }
  });