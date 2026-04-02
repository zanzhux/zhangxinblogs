import cover1 from '@/assets/images/1.jpg'
import cover2 from '@/assets/images/2.jpg'
import cover3 from '@/assets/images/3.jpg'
import cover4 from '@/assets/images/4.jpg'
import cover5 from '@/assets/images/5.jpg'
import cover6 from '@/assets/images/6.jpg'
import cover7 from '@/assets/images/7.jpg'
import cover8 from '@/assets/images/8.jpg'
import cover9 from '@/assets/images/9.jpg'
import cover10 from '@/assets/images/10.jpg'
import video7 from '@/assets/images/7.mp4'
import video8 from '@/assets/images/8.mp4'

export const personalAuthor = {
    id: 1,
    username: '张鑫',
    nickname: '张鑫',
    role: 'author',
    email: '2954723071@qq.com'
}

export const defaultArticles = [{
        id: 101,
        title: '在旅途中重新理解自己',
        created_at: '2024-03-10',
        tags: ['旅行', '生活随笔'],
        cover_image: cover1,
        author: personalAuthor,
        views_count: 128,
        comments: [],
        content: '<p>旅行对我来说不是打卡，而是和自己对话。离开熟悉环境后，很多原本混乱的念头会慢慢沉淀。</p><p>我喜欢把沿途看到的细节记下来：一段路、一种光线、一句陌生人的话。它们最后都会变成写作素材。</p>'
    },
    {
        id: 102,
        title: '海边散步与阅读时刻',
        created_at: '2026-02-22',
        tags: ['文学', '旅行'],
        cover_image: cover2,
        author: personalAuthor,
        views_count: 96,
        comments: [],
        content: '<p>有时候，一本书和一段海岸线就足够让一天变得完整。阅读让我学会慢下来，也让我更认真地观察生活。</p>'
    },
    {
        id: 103,
        title: '书店里的一小时',
        created_at: '2026-01-18',
        tags: ['文学', '生活随笔'],
        cover_image: cover3,
        author: personalAuthor,
        views_count: 84,
        comments: [],
        content: '<p>我很喜欢在书店里随意翻阅，遇到一句打动自己的话就记下来。它们像路标，提醒我不要停止思考。</p>'
    },
    {
        id: 104,
        title: '城市漫游：南京的一天',
        created_at: '2025-12-02',
        tags: ['旅行', '摄影'],
        cover_image: cover4,
        author: personalAuthor,
        views_count: 73,
        comments: [],
        content: '<p>一座城市最迷人的地方，往往不在热门景点，而在随机拐进的小巷、街角的咖啡香和黄昏的风。</p>'
    },
    {
        id: 105,
        title: '去山里走一走',
        created_at: '2025-11-11',
        tags: ['旅行', '摄影', '生活随笔'],
        cover_image: cover5,
        author: personalAuthor,
        views_count: 111,
        comments: [],
        content: '<p>爬山让我重新感受到节奏感：呼吸、脚步、停顿。很多焦虑在向上走的过程中自然就会被消解。</p>'
    },
    {
        id: 106,
        title: '操场上的夏天',
        created_at: '2024-06-02',
        tags: ['大学', '生活随笔', '摄影'],
        cover_image: cover6,
        author: personalAuthor,
        views_count: 62,
        comments: [],
        content: `<p>内蒙古财经大学的操场，六月的傍晚，跑道还带着一整天太阳晒过的温度。</p>
<p>那时候我们还没意识到，有些日子一旦过去就真的回不来了。蓝天、看台、灯杆——所有普通的东西，现在看起来都有点耀眼。</p>
<p>大学四年，操场是我和朋友说了最多闲话的地方，也是我一个人走了最多圈的地方。有些问题在兜圈子的过程中想通了，有些问题走到毕业都没有答案。</p>
<p>后来再见到这张照片，才发现那天的云真的很好看。</p>`
    },
    {
        id: 107,
        title: '青岛的夜，像一块发光的礁石',
        created_at: '2024-08-14',
        tags: ['旅行', '摄影', '生活随笔'],
        cover_image: cover7,
        author: personalAuthor,
        views_count: 88,
        comments: [],
        content: `<p>去青岛之前我以为它只是一座海边城市，去了才发现它更像一个时区错乱的地方——白天是欧式建筑和礁石，晚上是摩天楼的霓虹把整片海都染成了蓝紫色。</p>
<p>站在海边往市区望，那几栋楼像是从科幻小说里走出来的，但脚下的石头又很真实、很冰凉。</p>
<p>八月的青岛风很大，我把外套的帽子拉起来，站在那儿愣了很久。旁边的人都在拍照，我也拍了，但更多时候只是站着看。</p>
<p>有些景色，眼睛比镜头更诚实。</p>`
    },
    {
        id: 108,
        title: '深圳湾的落日',
        created_at: '2025-10-03',
        tags: ['旅行', '摄影', '深圳'],
        cover_image: cover8,
        author: personalAuthor,
        views_count: 74,
        comments: [],
        content: `<p>国庆假期第三天，我去了深圳湾公园。</p>
<p>没想到会有这么多人。几乎所有人都往同一个方向看——太阳要下山了，海面上的光像是被人泼了金漆，桥的轮廓慢慢变成剪影。</p>
<p>有人举着手机，有人什么都没拿，就那么站着。能让这么多陌生人同时停下脚步的事情，大概只有日落了。</p>
<p>我跟着人群等了大概四十分钟，太阳一点一点落进海里。等它完全消失的瞬间，周围有人小声"哇"了一声，然后大家就各自散开了。</p>
<p>很短，但很完整。</p>`
    },
    {
        id: 109,
        title: '山阴路的夏天',
        created_at: '2024-12-03',
        tags: ['音乐', '吉他', '生活随笔'],
        cover_image: '',
        author: personalAuthor,
        views_count: 53,
        comments: [],
        content: `<p>弹了《山阴路的夏天》。这首歌我断断续续练了很久，终于在十二月某个下午完整弹了一遍。</p>
<video controls style="width:100%;border-radius:4px;margin:1.2em 0;background:#000;" preload="metadata">
  <source src="${video8}" type="video/mp4" />
</video>
<p>山阴路是上海的一条路，我没去过，但这首歌里有一种很具体的夏天的感觉——热的、潮湿的、有点无聊但又很舍不得的那种。</p>
<p>吉他是我大一买的，从那时候起就一直跟着我。很多歌练了又放，放了又练，有些和弦到现在按起来还是有点别扭。</p>
<p>但喜欢一件事不一定要做到很好，做着做着，心就静了。</p>`
    },
    {
        id: 110,
        title: '广州·中山纪念堂',
        created_at: '2025-10-05',
        tags: ['旅行', '摄影', '广州'],
        cover_image: cover9,
        author: personalAuthor,
        views_count: 67,
        comments: [],
        content: `<p>国庆假期在广州，去了中山纪念堂。</p>
<p>从外面看，蓝色的琉璃瓦和红色的廊柱撑着整座建筑，气势很大，但不让人觉得压迫。广场上有一个穿白衬衫的人摆了个大字形的姿势在拍照，旁边的人路过，也不觉得奇怪。</p>
<p>纪念堂门口的孙中山雕像站得很端正，底座上刻着字，我走近去看了一会儿。</p>
<p>历史离我们到底有多远？不知道。但那天阳光很好，花坛里颜色很足，树修得很整齐，一切都显得挺认真的。</p>
<p>认真这件事，有时候本身就是一种答案。</p>`
    },
    {
        id: 111,
        title: '第一次跑宠物展',
        created_at: '2025-07-02',
        tags: ['工作', '深圳', '宠物'],
        cover_image: cover10,
        author: personalAuthor,
        views_count: 45,
        comments: [],
        content: `<p>七月初，第一次以销售的身份去宠物展跑客户。</p>
<p>展馆很大，展架一排接一排，人声、狗叫声、猫叫声混在一起，加上场馆里的空调和外面进来的热气，整个环境有点超现实。</p>
<p>我提前查过参展商名单，圈出了几个目标客户，背着包在会场里转了好几圈，一家一家搭话。有些人很友善，聊了很久；有些人只扫了一眼名片就转身了。</p>
<p>那天走了很多路，鞋底都热了，但收获了几个真正有意向的联系方式。</p>
<p>后来想想，做销售这件事，不怕碰壁，怕的是开口之前就退缩了。</p>`
    },
    {
        id: 112,
        title: '公司养了一只猫',
        created_at: '2025-06-17',
        tags: ['生活随笔', '工作'],
        cover_image: '',
        author: personalAuthor,
        views_count: 91,
        comments: [],
        content: `<p>公司养了一只猫。</p>
<video controls style="width:100%;border-radius:4px;margin:1.2em 0;background:#000;" preload="metadata">
  <source src="${video7}" type="video/mp4" />
</video>
<p>它大概在六月初出现的，具体是谁带来的已经搞不清楚了。一开始还有点认生，躲在角落里，后来慢慢就开始在工位之间乱逛了。</p>
<p>开会的时候它会跳上空着的椅子，也会在你最专注的时候踩上键盘。有人烦它，也有人专门去给它买零食。</p>
<p>上班压力大的时候，能摸一下猫，会突然感觉一切都没那么严重。</p>
<p>动物有时候比人更懂得怎么存在于当下。</p>`
    }
]