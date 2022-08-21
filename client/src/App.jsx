import fetchJSONP from 'fetch-jsonp';
import { useEffect, useRef, useState } from 'react';
import './App.css';
import reactLogo from './assets/react.svg';

function App() {
  const [count, setCount] = useState(20);
  const [record, setRecord] = useState([]);
  // 0 平 -1 输 1 赢
  const [resultRecord, setResultRecord] = useState([]);

  const [loseRecord, setLoseRecord] = useState([]);

  const [end, setEnd] = useState(false);

  let curCount = useRef(0);

  const reset = async () => {
    await fetchJSONP('http://192.168.2.103:8888/guess.php?reset=1');
  }

  const request = async (name, time, count, callback) => {
    const response = await fetchJSONP('http://192.168.2.103:8888/guess.php?time=' + time + '&name=' + name + '&count=' + count)
    const json = await response.json();
    console.log(json)
    if (!json || json.state == 0) {
      return;
    }
    callback(json.ret, json.value);
  };

  function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg); //获取url中"?"符后的字符串并正则匹配
    var context = "";
    if (r != null)
      context = decodeURIComponent(r[2]);
    reg = null;
    r = null;
    return context == null || context == "" || context == "undefined" ? "" : context;
  }


  const checkEnd = () => {
    let winCount = 0;
    let loseCount = 0;
    for (const res of resultRecord) {
      if (res == '赢') {
        winCount++;
      } else if (res == '输') {
        loseCount++;
      }
    }
    if (winCount > loseCount) {
      alert('牛逼，你赢了');
    } else if (winCount < loseCount) {
      alert('菜鸟，你输了');
    } else {
      alert('平局，皆大欢喜');
    }
    setEnd(true)
  };

  const retryRequest = (curValue) => {
    request(GetQueryString("name"), resultRecord.length, curValue, (res, loseCount) => {
      let resStr = '赢';
      if (res == 0) {
        resStr = '平';
      } else if (res < 0) {
        resStr = '输';
      }
      setResultRecord([...resultRecord, resStr]);
      setLoseRecord([...loseRecord, loseCount]);
    });
  }

  useEffect(() => {
    if (resultRecord.length >= 3) {
      setTimeout(() => {
        checkEnd();
      }, 500);
    }
  }, [resultRecord]);

  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>猜豆子</h1>
      <div className="card">
        <button>
          剩余豆子为 {count}
        </button>
        <br />
        <input
          id="inputNum"
          type="number"
          placeholder="本轮豆子数目"
          max={count}
          min="1"
          onChange={() => {
            const inputRef = document.getElementById('inputNum');
            const curValue = inputRef.value;
            if (curValue > count - 2 + record.length) {
              inputRef.value = count - 2 + record.length;
            }
          }}
        ></input>
        <br />

        {!end &&
          <button
            id="inputConfrim"
            onClick={() => {
              const inputRef = document.getElementById('inputNum');

              const curValue = inputRef.value;
              if (!curValue || curValue == 0) {
                alert('豆子数目最少为 1');
                return;
              }
              if (record.length > resultRecord.length) {
                // retryRequest(curCount.current)
                alert('请等对手出手后再提交');
                return;
              }
              setRecord([...record, curValue]);
              setCount((count) => count - curValue);
              inputRef.value = null;
              curCount.current = curValue;
              retryRequest(curValue)
            }}
          >
            确定提交
          </button>
        }

        {
          !end &&
          <button
            id="refresh"
            onClick={() => {
              retryRequest(curCount.current)
            }}
          >
            催催对手
          </button>
        }

        <br />
        <button
          id="reset"
          onClick={async () => {
            await reset();
            location.reload();
          }}
        >
          重新开始
        </button>
        <p>你的投注记录：{JSON.stringify(record)}</p>
        <p>你的输赢记录：{JSON.stringify(resultRecord)}</p>
        <p>历史输家记录：{JSON.stringify(loseRecord)}</p>
      </div>
    </div>
  );
}

export default App;
