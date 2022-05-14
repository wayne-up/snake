//将整个游戏容器看作一个由20*20的小方块构成的容器
var sw=20,//一个方块的宽度
    sh=20,//一个方块的长度
    tr=30,//行数
    td=30 //列数
var snake=null//蛇的实例
var food=null//食物的实例
var game=null//游戏的实例
//构造蛇头，蛇身，食物小方块的函数
function Square(x,y,classname){
    //x y坐标，classname样式
    this.x=x*sw  
    this.y=y*sh  
    this.class=classname  
    //生成小方块div
    this.viewContent=document.createElement('div')  
    this.viewContent.className=this.class  
    //指定父容器为snakeWrap
    this.parent =document.querySelector('.snakeWrap')  
}
Square.prototype.create=function(){
    //将方块放入容器
    this.viewContent.style.position='absolute'
    this.viewContent.style.width=sw+'px'
    this.viewContent.style.height=sh+'px'
    this.viewContent.style.left=this.x+'px'
    this.viewContent.style.top=this.y+'px'
    this.parent.appendChild(this.viewContent)
}
//删除方块dom
Square.prototype.remove=function(){
    this.parent.removeChild(this.viewContent)
}

//蛇的构造函数
function Snake(){
    this.head=null//蛇头的信息
    this.tail=null//蛇尾的信息
    this.pos=[]//蛇身上每一个方块的位置
    this.directionNum={
        //蛇走的方向
        left:{
            x:-1,
            y:0,
            rotate:180//蛇头应该旋转的度数
        },
        right :{
            x:1,
            y:0,
            rotate:0
        },
        up :{
            x:0,
            y:-1,
            rotate:-90
        },
        down :{
            x:0,
            y:1,
            rotate:90
        },
    }
}

//初始化蛇
Snake.prototype.init=function(){
    //创建蛇头
    var snakeHead = new Square(2,0,'snakeHead')
    snakeHead.create()
    this.head=snakeHead
    this.pos.push([2,0])//存储蛇头位置

    //创建蛇身体1
    var snakeBody1=new Square(1,0,'snakeBody')
    snakeBody1.create()
    this.pos.push([1,0])

    //创建蛇身体2
    var snakeBody2=new Square(0,0,'snakeBody')
    snakeBody2.create()
    this.tail=snakeBody2
    this.pos.push([0,0])

    //形成链表关系
    snakeHead.last=null
    snakeHead.next=snakeBody1

    snakeBody1.last=snakeHead
    snakeBody1.next=snakeBody2

    snakeBody2.last=snakeBody1
    snakeBody2.next=null

    //给蛇添加一个默认方向
    this.direction=this.directionNum.right
}

//获取蛇头下一个位置对应的元素
Snake.prototype.getNextPos=function(){
    var nextPos=[//蛇头要走的下一个点的坐标
        this.head.x/sw+this.direction.x,
        this.head.y/sw+this.direction.y
    ]

    //下个点是自己，代表撞到了自己，游戏结束
    var selfCollied=false//是否撞到自己
    this.pos.forEach(function(val){
        if(val[0]==nextPos[0] &&val[1]==nextPos[1]){
            selfCollied=true
        }
    })
    if(selfCollied) 
        {console.log('撞自己了')
            this.strategies.die.call(this)
        return
        }

    //下个点是墙，代表撞到了墙，游戏结束
    if(nextPos[0]<0 ||nextPos[0]>td-1 ||nextPos[1]<0 ||nextPos[1]>tr-1)
    {
        console.log('撞墙了')
        this.strategies.die.call(this)
        return
    }

    //下个点是食物，吃
    if(food&&nextPos[0]==food.pos[0]&&nextPos[1]==food.pos[1]){//条件成立说明下一个点时食物
        this.strategies.eat.call(this)
        return
    }
    //下个点什么都不是，走
    this.strategies.move.call(this)
}

//处理碰撞后要做的事
Snake.prototype.strategies={
    //format决定是否删除最后一个方块
    move(format){
        // console.log('move')
        //创建一个新身体(放到旧蛇头的位置)
        var newBody = new Square(this.head.x/sw,this.head.y/sh,'snakeBody')
        //更新链表关系
        // this.head.next.last=newBody
        newBody.next=this.head.next
        newBody.next.last=newBody
        newBody.last=null

        this.head.remove()
        newBody.create()

        //创建新蛇头(放到nextPos)
        var newHead=new Square(this.head.x/sw+this.direction.x,this.head.y/sw+this.direction.y,'snakeHead')
        //旋转蛇头
        newHead.viewContent.style.transform=`rotate(${this.direction.rotate}deg)`
        //更新链表关系
        newBody.last=newHead
        newHead.next=newBody
        newHead.last=null

        newHead.create()

        //更新坐标信息
        //放入newHead
        this.pos.unshift([this.head.x/sw+this.direction.x,this.head.y/sw+this.direction.y])
        this.head=newHead

        if(!format){//如果format的值为false，表示需要删除（除了吃之外的操作）
            this.tail.remove()
            this.tail=this.tail.last
            this.pos.pop()
        }
    },
    eat(){
        this.strategies.move.call(this,true)
        console.log(this)
        food.remove()
        game.score++
        createFood()
    },
    die(){
        console.log('die')
        game.over()
    }
}



// snake.init()

//创建食物
function createFood(){
    //食物小方块的随机坐标
    var x= null;
    var y=null;
    //循环跳出的条件，true表示食物坐标在蛇身上，需要继续循环
    var include=true;
    while(include){
        //生成0-29的随机数
        x=Math.round(Math.random()*(td-1))
        y=Math.round(Math.random()*(tr-1))

        snake.pos.forEach(function(val){
            //如果坐标不在蛇身上
            if(val[0]!=x&&val[1]!=y){
                include=false
            }
        })
    }
    food=new Square(x,y,'food')
    food.pos=[x,y]//存储食物坐标
    food.create()
}
// createFood()

//游戏构造函数
function Game(){
    this.timer=null
    this.score=0
}
Game.prototype.init=function(){
    snakeWrap=document.querySelector('.snakeWrap')
    snakeWrap.innerHTML=''//清空残留的蛇
    snake=new Snake()
    snake.init()
    createFood()
    document.onkeydown=function(e){
        if(e.code=='ArrowLeft' &&snake.direction!=snake.directionNum.right){
            //往右走时不能按左键
            snake.direction=snake.directionNum.left
        }else if(e.code=='ArrowUp' &&snake.direction!=snake.directionNum.down){
            snake.direction=snake.directionNum.up
        }else if(e.code=='ArrowRight' &&snake.direction!=snake.directionNum.left){
            snake.direction=snake.directionNum.right
        }
        else if(e.code=='ArrowDown' &&snake.direction!=snake.directionNum.up){
            snake.direction=snake.directionNum.down
        }
    }
    this.start()
}
Game.prototype.start=function(){
    this.timer=setInterval(function(){
        snake.getNextPos()
    },200-(game.score*2))
}
Game.prototype.over=function(){
    clearInterval(this.timer)
    alert('你的得分为：'+game.score)
    stratBtn.parentNode.style.display='block'
    //更新记录
    if(game.score>localStorage.getItem('score')){
        localStorage.setItem('score',game.score)
    }
    record.innerHTML=`你的最高分数为：${localStorage.getItem('score')}`
}
Game.prototype.pause=function(){
    clearInterval(this.timer);
}

//开始游戏
var stratBtn=document.querySelector('.startBtn').children[0]
stratBtn.onclick=function(){
    game=new Game()
    stratBtn.parentNode.style.display='none'
    game.init()
}
// 暂停游戏
var pauseBtn=document.querySelector('.pauseBtn button')
snakeWrap=document.querySelector('.snakeWrap')
snakeWrap.onclick=function(){
    game.pause()
    pauseBtn.parentNode.style.display='block'
}
//继续游戏
pauseBtn.onclick=function(){
    game.start()
    pauseBtn.parentNode.style.display='none'
}