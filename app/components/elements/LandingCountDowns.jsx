import React from 'react'
import Icon from 'app/components/elements/Icon'
import {APP_ICON} from 'app/client_config'

export default class LandingCountDowns extends React.Component {

  state = {
    secondsSinceEpoch: Math.round(((new Date()).getTime()) / 1000)
  }

  updateTime = () => {
    this.setState({secondsSinceEpoch: this.state.secondsSinceEpoch + 1})
  }

  componentWillMount() {
    if(process.env.BROWSER) this.updateTime = setInterval(this.updateTime, 1000);
  }

  componentWillUnmount() {
    if(process.env.BROWSER) clearInterval(this.updateTime)
  }

  render() {
    function strSplice(str1, str2, location) {
      return str1.slice(0, location) + str2 + str1.slice(location, str1.length);
    }

    function addCommas(number) {
      var returnvalue = number.toString();
      var length = returnvalue.length;
      var commas = Math.ceil(length / 3) - 1;
      for (var i = 1; i <= commas; i++) {
        returnvalue = strSplice(returnvalue, " ", (length - i * 3));
      }
      return returnvalue;
    }

    function calculateBlock(current_time) {
      return Math.round((current_time - (1476789457)) / 3);
    }

    return (
      <section className="CountDowns" id="CountDowns">
        <div className="CountDowns__headers">
          <div className="row text-center">
            <div className="small-12 columns">
              <strong className="CountDowns__slogan" id="countdown">Сила ГОЛОСА на вес Золота!</strong>
              {process.env.BROWSER && <div className="CountDowns__logo wow fadeInLeft"><Icon name={APP_ICON} size="10x" /></div>}
              <h1 className="CountDowns__headers__h1">ГОЛОС Медиаблокчейн</h1>
            </div>
          </div>
        </div>

        <div className="row CountDowns__blocks" id="docs">
          <div className="small-12 columns">
            <div className="CountDowns__links">
              <a href="https://golos.io/ru--golos/@golos/golos-russkoyazychnaya-socialno-mediinaya-blokchein-platforma" target="blank" className="CountDowns__button_small text-left">White Paper</a>
            </div>
            <center>
              <p>Текущий блок: {addCommas(calculateBlock(this.state.secondsSinceEpoch))}</p>
            </center>
          </div>
        </div>
        <div className="row Documentation__buttons text-center">
          <div className="small-12 columns">
            <a href="/welcome" target="blank" className="button">Гид по платформе Голос</a>
            <a href="https://golos.io/ru--golos/@bitcoinfo/samyi-polnyi-f-a-q-o-golose-spisok-luchshykh-postov-raskryvayushikh-vse-aspekty-proekta-bonusy-v-vide-kreativa" className="button">FAQ</a>
            <a href="https://wiki.golos.io/" target="blank" className="button">Вики</a>
            <a href="https://www.youtube.com/c/golosioru" target="blank" className="button alert">YouTube канал</a>
          </div>
        </div>
      </section>
    )
  }
}
