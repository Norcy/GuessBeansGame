<?php
$locale='en_US.UTF-8';
setlocale(LC_ALL,$locale);
header('Content-type:application/json;charset=utf-8');
header('Access-Control-Allow-Origin', '*');
putenv('LC_ALL='.$locale);
// header("content-type:text/html;charset=utf-8");

$user = 'root';
$password = 'root';
$db = 'guess';
$host = 'localhost';
$port = 3306;

// 创建连接
$conn = new mysqli($host, $user, $password, $db);
// 检测连接
if ($conn->connect_error) {
    die("连接失败: " . $conn->connect_error);
} 

// $link = mysqli_init();
// $success = mysqli_real_connect(
//    $link, 
//    $host, 
//    $user, 
//    $password, 
//    $db,
//    $port
// );
// echo $success;



$name = $_GET['name'];
$time = $_GET['time'];
$count = $_GET['count'];
$reset = $_GET['reset'];
$callback = isset($_GET['callback']) ? trim($_GET['callback']) : '';

if ($reset) {
    $deleteSql = "Delete FROM GuessInfo";
    $result = $conn->query($deleteSql);
    $tmp = json_encode(['msg'=> 'Delete 成功']);
    echo $callback . '('. $tmp . ')';  
} else {
    // 第一步，如果自己没记录则插入
    $querySql = "SELECT name FROM GuessInfo WHERE name='$name' AND time='$time'";
    $result = $conn->query($querySql);
    if ($result->num_rows) {
    } else {
        $insertSql = "INSERT INTO GuessInfo (name, time, count)
        VALUES ('$name', $time, $count)";
        
        if ($conn->query($insertSql) === TRUE) {
            // echo "新记录插入成功\n";
        }
    }

    // 第二步，查询对手记录，如果存在则可以返回数据
    $ret = NULL;
    $queryVSSql = "SELECT * FROM GuessInfo WHERE name!='$name' AND time='$time'";
    $result = $conn->query($queryVSSql);
    if ($result->num_rows) {
        while($row = $result->fetch_assoc()) {
            if ($row["count"] == $count) {
                $ret = ['value' => $count, 'ret' => 0, 'state' => 1];
            } else if ($row["count"] > $count) {
                $ret = ['value' => $count, 'ret' => -1, 'state' => 1];
            } else {
                $ret = ['value' => $row["count"], 'ret' => 1, 'state' => 1];
            }
        }
        // echo "对手已有记录\n";
    } else {
        // echo "等待对手记录\n";
        $ret = ['state' => 0];
    }
    $tmp = json_encode($ret);
    echo $callback . '(' . $tmp .')';  
}
?>