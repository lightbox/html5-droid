$(function() {
var rstate = {
    started: false,
    turn: 0, //which means looks at you
    turnspeed: 0,
    turnspeedtarget: 0,
    turnreset: false,
    jumpqueue: [],
    jump: 0,
    talking: false,
    platform: '',
    laststate: '',
    buttonstate: {
        up: false,
        down: false,
        left: false,
        right: false
    },
    correctstate: true, //whether the user is doing what it's supposed to do
    badness: 0,
    combo: false //when the user presses something else as well
}

if ($.browser.mozilla) {
    rstate.platform = '-moz-transform';
} else if ($.browser.webkit) {
    rstate.platform = '-webkit-transform';
} else if ($.browser.opera) {
    rstate.platform = '-o-transform';
} else if ($.browser.msie) {
    rstate.platform = 'msTransform';
}
if(rstate.platform == '') {alert('platform not supported');}

$('#android').bind('repaint', function() {
    var deg, style;
    if(rstate.turn < 0) {rstate.turn += 8;}
    rstate.turn %= 8;
    deg = rstate.turn / 8 * Math.PI * 2;
    if(rstate.laststate == deg + ' / ' + rstate.jump + ' / ' + rstate.badness) { return;}
    if(rstate.repainting) {console.log(new Date());return;}
    rstate.repainting = true;
    style = {};

    $('#android').removeClass().addClass('turn_'+Math.round(rstate.turn));
    if((rstate.jump+'').substr(0,1) == 'b') {
        style[rstate.platform] = 'translate(0px,'+ Math.round(-rstate.jump.substr(1)) + 'px)';
        $('#android .robot_body').css(style);
    } else if((rstate.jump+'').substr(0,1) == 't') {
        style[rstate.platform] = 'translate(0px,'+ Math.round(-rstate.jump.substr(1)) + 'px)';
        $('#android .robot_head').css(style);
    } else {
        style[rstate.platform] = 'translate(0px,'+ Math.round(-rstate.jump) + 'px)';
        $('#android .robot').css(style);
        style[rstate.platform] = 'translate(0px,'+ Math.round(-rstate.jump/5) + 'px)';
        $('#android .robot_head').css(style);
    }
    style[rstate.platform] = 'translate('+Math.round((Math.cos(deg)-1)* 72) + 'px,'+Math.round(Math.sin(deg)*8)+'px)';
    $('#android .robot_limb.arm.left').css(style);

    style[rstate.platform] = 'translate('+Math.round(-(Math.cos(deg)-1)* 72) + 'px,'+Math.round(-Math.sin(deg)*8)+'px)';
    $('#android .robot_limb.arm.right').css(style);

    style[rstate.platform] = 'translate('+((Math.cos(deg)-1)* 19) + 'px,'+Math.round(Math.sin(deg)*4)+'px)';
    $('#android .robot_limb.leg.left').css(style);

    style[rstate.platform] = 'translate('+(-(Math.cos(deg)-1)* 19) + 'px,'+Math.round(-Math.sin(deg)*4)+'px)';
    $('#android .robot_limb.leg.right').css(style);

    
    $('#android #badness').removeClass().addClass('bad_' + Math.floor(rstate.badness));
    rstate.laststate = deg + ' / ' + rstate.jump + ' / ' + rstate.badness;
    rstate.repainting = false
});

rstate.desiredstate = '';
rstate.cycleinstate = 0;
rstate.c = 0;
rstate.alive = true;
var dfunny = {
    '': 'DO NOTHING STAY',
    'up': 'JUMP like crazy',
    'down': 'talk DOWN to me',
    'left': 'spin to the LEFT',
    'right': 'RIGHT your spin',
    'dead': 'EVERYTHING ENDS'
}

setInterval(function() {
    rstate.c += 1;
    //moving the robot
    if(rstate.turnreset && Math.abs(rstate.turn) <= .5) {
        rstate.turntarget = 0;
        rstate.turnspeed = 0;
        rstate.turn = 0;
        rstate.turnspeedtarget = 0;
        rstate.turnreset = false;
    }
    if(rstate.talking) {
        if(rstate.jumpqueue.length == 0) {
            rstate.jumpqueue.push(0, 't1','t3','t0','t-2','t2','t0')
        }
    }
    rstate.turnspeed = (rstate.turnspeed + rstate.turnspeedtarget) / 2;
    if(Math.abs(rstate.turnspeed - rstate.turnspeedtarget) < .001) {rstate.turnspeed = rstate.turnspeedtarget;}
    rstate.turn += rstate.turnspeed;
    rstate.jump = rstate.jumpqueue.length ? rstate.jumpqueue.shift() : 0;
    
    //handling the current state
    if(rstate.c == 25) {
        rstate.started = true;
        rstate.cycleinstate = 0;
        rstate.desiredstate = ['up','down','left','right'][Math.floor(Math.random() * 4)];
        $('#task .content').html(dfunny[rstate.desiredstate]);
    } else {
        if(Math.random() > 0.5 && rstate.cycleinstate > 500 / Math.log(rstate.c+1) ) {
            rstate.started = true;
            rstate.cycleinstate = 0;
            rstate.desiredstate = ['up','down','left','right',''][Math.floor(Math.random() * 5)];
            $('#task .content').html(dfunny[rstate.desiredstate]);
        } else {
            rstate.cycleinstate += 1;
        }
    }
    //rstate.desiredstate = 'left';
    if(rstate.desiredstate == '') {
        rstate.correctstate = !rstate.buttonstate.up && !rstate.buttonstate.down && !rstate.buttonstate.left && !rstate.buttonstate.right;
        rstate.combo = false;
    } else {
        rstate.correctstate  = !!rstate.buttonstate[rstate.desiredstate];
        rstate.combo = (rstate.buttonstate.up + rstate.buttonstate.down + rstate.buttonstate.left + rstate.buttonstate.right) > 1;
    }
    if(!rstate.correctstate) {
        if(Math.random() > .9) {
            rstate.badness = Math.min(11, rstate.badness + 1);
        }
        if(rstate.badness == 11) {
            rstate.alive = false;
        }
    } else {
        if(rstate.alive && rstate.started) {
            score += Math.floor(Math.random() * Math.log(rstate.c + 10));
            $('#val_score').html(score);
        }

    }
    //repainting
    if(rstate.alive) {
        $('#android').trigger('repaint');
    } else {
        $('#task .content').html(dfunny['dead']);
        $('#startagain').show();
        setTimeout(function() {
            $('#android .robot div').slideUp();
            $('#android').slideUp('slow');
        },500);
    }
},40);


$('#android').bind('control',function(e,data) {
    if(data.mode == 'start') {
        $('#buttons a#' + data.type).addClass('active');
        rstate.buttonstate[data.type] = true;
        if(data.type == 'left') {
            rstate.turnspeedtarget = Math.min(.5,rstate.turnspeedtarget + .5);
        } else if(data.type == 'right') {
            rstate.turnspeedtarget = Math.max(-.5,rstate.turnspeedtarget - .5);
        } else if(data.type == 'up') {
            if(rstate.jumpqueue.length) {return}
            jumpqueue = [];
            i = 0;
            do {
                i += 1;
                jumpqueue.push(Math.sin(i/10 * Math.PI)*40);
            } while(jumpqueue[jumpqueue.length - 1] > 1)
            jumpqueue.push('b-2','b-4','b-2','b0')
            rstate.jumpqueue = jumpqueue;
        } else if(data.type == 'down') {
            if(!rstate.buttonstate.left && !rstate.buttonstate.right) {
                rstate.turnspeedtarget = rstate.turn < 4 ? -.25 : .25;
                rstate.turnreset = true;
            }
            rstate.talking = true;
        }
    } else if(data.mode == 'end') {
        $('#buttons a#' + data.type).removeClass('active');
        rstate.buttonstate[data.type] = false;
        if(data.type == 'left' || data.type == 'right') {
            rstate.turnspeedtarget = 0;
        }
        else if(data.type == 'down') {
            rstate.talking = false;
        }
    }
});

if(!!('ontouchstart' in window)) {
    $('#buttons').on('touchstart touchend click', 'a', function(e) {
        var ti=$(this).attr('id'), fire;
        e.preventDefault();
        
        if(e.type == 'mousedown' || e.type == 'mouseup') {return;}
        e.stopPropagation();
        if(e.type == 'click') {return;}
        if(e.type == 'touchstart') {
            fire = function() {
                $('#android').trigger('control', {mode: 'start', 'type': ti});
            }
            fire();
            $('#buttons').data('pressing', setInterval(fire, 300));
        } else {
            clearInterval($('#buttons').data('pressing'));
            $('#android').trigger('control', {mode: 'end', 'type': ti});
        }
    });
    $('#buttons').show();
} else {
    $(window).bind('keydown keyup',function(e) {
        var keys = {
            '37': 'left',
            '38': 'up',
            '32': 'up', //space
            '39': 'right',
            '40': 'down'
        };
        if(!keys[e.keyCode]) {
            return;
        }
        e.preventDefault();
        $('#android').trigger('control', {'mode': e.type == 'keydown' ? 'start' : 'end', 'type': keys[e.keyCode]});
    });
}

score = 0;

$('#content').css({'opacity': 1});

});