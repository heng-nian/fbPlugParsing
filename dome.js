
function tellraw(name, msg) { game.oneShotCommand(tellrawText(name, msg)) };
function tellrawText(name, msg) { return `tellraw ${name} {\"rawtext\":[{\"text\":\"${msg}\"}]}`; }
function execute(name, cmd, callback) { game.sendCommand(`execute ${name} ~~~ ` + cmd, callback) };
engine.setName('framework');
engine.waitConnectionSync();
engine.message('运行');
let base = {//存储着基本参数
  commandPrefix: ".",//以 . 为命令的前缀触发
  Az: true,//命令是否忽略大小写 如为ture则 help HELP 皆会触发
}

let commandForm = {};//存储着命令信息

function commandAnalysis() {//先站着名字

}

function commandRegister(cmd, callback) {//命令解析 并存入 commandForm  格式为 xxx命令:{描述}
  let arg = {}
  arg.original = cmd
  arg.callback = callback;
  cmd = cmd.split(" ");
  arg.command = cmd.shift();
  arg.args = cmd.map(v => {
    let args = {}
    v = v.split("=");
    args.default = v[1];//默认值 
    let reg = new RegExp("^(\\[|\\<)[A-z0-9]+\\:(\\|?[A-z0-9])+(\\]|\\>)$")
    if (!reg.test(v[0])) throw new Error(`注册命令描述错误 于：${v.join("=")}\n${JSON.stringify(arg, null, 2)}`);
    args.state = v[0][0] == "[" ? "optional" : "required";
    v = v[0].slice(1, -1).split(":");
    args.key = v[0];
    args.type = v[1].split("|");
    return args
  })
  if (commandForm[arg.command]) throw new Error(`注册命令重复错误 于：${JSON.stringify(arg, null, 2)}`);
  commandForm[arg.command] = arg;
  engine.message(JSON.stringify(arg, null, 2));
}

game.listenChat(function (name, msg) {
  if (name === "") return;//非名 
  if (msg[0] != base.commandPrefix) return;
  let player = {
    name: name,
    msg: msg
  };
  msg = msg.split(" ");
  if (base.Az) msg[0] = msg[0].toLowerCase();
  let command = commandForm[msg[0].slice(1)]
  if (!command) return engine.message("ERROR:命令不存在" + msg[0].slice(1));
  msg.shift();
  let args = {};//被拟造的参数对象
  for (let i = 0; i < command.args.length; i++) {
    let arg = command.args[i]
    if (arg.state == "optional" && arg.default == undefined) {
      engine.message(`ERROR: 于:${command.original} 中 ${arg.key}无默认参数`);
      throw new Error();
    }
    if (arg.state == "optional" && msg[0] == undefined) msg[0] = arg.default;
    for (let j = 0; j < arg.type.length; j++) {
      let v = arg.type[j]

      if (v == "number") {
        let num = Number(msg[0]);
        if (isNaN(num)) { break; }
        args[arg.key] = Number(msg.shift()); break;
      } else if (v == "boolean") {
        if (!/(true)|(false)/.test(msg[0])) { break; }
        args[arg.key] = msg.shift() == "true" ? true : false; break;
      } else if (v == "string") {
        if (!msg[0]) break;
        args[arg.key] = msg.shift(); break;
      } else if (v == msg[0]) { args[arg.key] = msg.shift(); break; }
    }

    if (args[arg.key] == undefined) {
      // args={};
      tellraw(name, `ERROR: 命令于${command.original}  在第${i + 1}个参数时出现错误 ${msg[0]} not ${arg.type.join("|")} `);
      break;
    }

  }
  engine.message(JSON.stringify(args, null, 2));
  if (Object.keys(args).length) command.callback.bind(player)(args)
})





commandRegister("help [p:number]=0", function ({ p }) {
  tellraw(this.name, "帮助" + p)
})
commandRegister("youyu <sese:string>=有余的pipi [to:boolean]=true [pipi:daPiPi|xiaoPiPi]=daPiPi", function ({ sese, to, pipi }) {
  tellraw(this.name, [sese, to, pipi].join("-----"))
})
engine.message(JSON.stringify(commandForm, null, 2));
// game.subscribePacket("IDAdventureSettings", function (data) {
//   entity.message(JSON.stringify(data))
// })

//538950
//script dome.js