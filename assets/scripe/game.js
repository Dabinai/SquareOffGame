// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        blockNode: cc.Node,
        baseNodeArr: [cc.Node],
        wallNodeArr: [cc.Node],
        scoreLabel: cc.Label,
    },



    onLoad() {
        this.node.on("touchstart", this.grow, this)
        this.node.on("touchend", this.stop, this)
        this.init()
    },


    onDestroy() {
        this.node.off("touchstart", this.grow, this)
        this.node.off("touchend", this.stop, this)

    },

    grow() {
        if (this.gameState != 'idle') return
        this.gameState = 'grow'
        let seq = cc.sequence(
            // cc.tween().to(1,{scale:4}).start(),
            cc.scaleTo(1, 4),
            cc.callFunc(() => {

            })
        );
        this.growAction = this.blockNode.runAction(seq)
    },

    stop() {
        if (this.gameState != 'grow') return
        this.gameState = 'rota'
        this.blockNode.stopAction(this.growAction)
        // this.rotaAction = this.blockNode.runAction(cc.rotateTo(0.15,0))
        this.blockNode.runAction(cc.sequence(
            cc.rotateTo(0.15, 0),
            cc.callFunc(() => {
                if (this.blockNode.width * this.blockNode.scaleX <= this.baseNodeArr[1].x - this.baseNodeArr[0].x) {
                    this.blockNode.runAction(cc.sequence(
                        cc.moveTo(0.7, cc.v2(0, -1000)),
                        cc.callFunc(() => {
                            this.gameOver()
                        })
                    ))
                } else {
                    if (this.blockNode.width * this.blockNode.scaleX <= this.wallNodeArr[1].x - this.wallNodeArr[0].x) {
                        this.bouce(true)
                    } else {
                        this.bouce(false)
                    }
                }
            })
        ))
    },

    bouce(success) {
        let desY = -(cc.winSize.height / 2 - this.baseNodeArr[0].height - this.blockNode.height * this.blockNode.scaleX / 2)
        if (!success) {
            desY += this.wallNodeArr[0].height
        }

        this.blockNode.runAction(cc.sequence(
            cc.moveTo(0.7, cc.v2(0, desY)).easing(cc.easeBounceOut()),
            cc.callFunc(() => {
                if (success) {
                    this.updateScore(1)
                    this.nextLevel();
                } else {
                    this.gameOver();
                }
            })
        ))
    },

    gameOver() {
        cc.director.loadScene("game")
    },

    init() {
        this.score = 0
        this.nextLevel()
        this.resetBgColor()

    },

    placeWall(node, desX) {
        node.runAction(
            cc.moveTo(0.5, cc.v2(desX, node.y)).easing(cc.easeQuinticActionIn())
        )
    },

    resetWall() {
        let baseGap = 100 + Math.random() * 100;
        let wallGap = baseGap + 30 + Math.random() * 80;

        this.placeWall(this.baseNodeArr[0], -baseGap / 2)
        this.placeWall(this.baseNodeArr[1], baseGap / 2)
        this.placeWall(this.wallNodeArr[0], -wallGap / 2)
        this.placeWall(this.wallNodeArr[1], wallGap / 2)

    },

    resetBlock() {
        this.blockNode.runAction(cc.sequence(
            cc.spawn(
                cc.rotateTo(0.5, -45),
                cc.moveTo(0.5, cc.v2(0, 400)),
                cc.scaleTo(0.5, 1)
            ),
            cc.callFunc(() => {

            })
        ))
    },


    resetBgColor(){
        let colors = ['#4cb4e7','#ffc09f','#c7b3e5','#588c7e','#a3a380']
        this.node.color = cc.Color.BLACK.fromHEX(colors[parseInt(Math.random()*colors.length)])
    },

    nextLevel(){
        this.gameState = 'idle'
        this.resetWall()
        this.resetBlock()
    },


    updateScore(incr){
        this.score += incr
        this.scoreLabel.string = this.score
    }
});
