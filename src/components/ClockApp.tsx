import * as React from "react";

interface Props {
}

interface State {
}

export default class ClockApp extends React.PureComponent<Props, State> {
  componentDidMount() {
    document.title = "Warframe Overlay Plains Clock - poepoe.org";
  }

  render() {
    return (
      <div className="container-fluid">
        <section>
          <div className="card-deck my-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Description</h5>
                <p>
                  A simple overlay application for Warframe that shows the{" "}
                  current time at Plains of Eidolon.
                </p>
                <p>
                  <strong>
                    Warning: This program obtains information by parsing{" "}
                    <a href="http://content.warframe.com/dynamic/worldState.php">
                      worldState.php
                    </a> and{" "}
                    <span title="%LOCALAPPDATA%\Warframe\EE.log">
                      the log file of the game
                    </span>. This program{" "}
                    will NOT modify the game files or process memory,{" "}
                    and I don't <i>think</i> using this program would{" "}
                    violate the ToS of the game.{" "}
                    However, USE AT YOUR OWN RISK, as always.
                  </strong>
                </p>
                <p>
                  <strong>
                    Note: To use this program, you have to run the game in{" "}
                    "Windowed" or "Borderless Fullscreen" mode.{" "}
                  </strong>
                  Due to how the game works in "Fullscreen" mode, it's not{" "}
                  possible to support that as a third-party program.{" "}
                  The overlay implements "Standalone" mode: if you have{" "}
                  multiple monitors, you can run the clock overlay in the{" "}
                  other monitor, as a separate window.
                </p>
                <p>
                  Note: As of 2019-04-01, the application uses bounties{" "}
                  expiry information from EE.log (the log file which the{" "}
                  emits automatically){" "}
                  as well as worldState.php. It shows the accurate time for{" "}
                  the host while in the Plains, but otherwise the time may{" "}
                  be off by ~1 minute, similar to other PoE clocks.
                </p>
                <p>
                  This program is a free software and licensed under{" "}
                  the MIT License. It comes without any warranty.{" "}
                  As of 2019-05-06, the comiled binary contains data from{" "}
                  <a href="https://github.com/WFCD/warframe-worldstate-data">
                    Warframe Worldstate Data
                  </a>.
                </p>
                <p>
                  <a href="https://www.reddit.com/r/Warframe/comments/ajbqvv/yet_another_plains_of_eidolon_clock/">
                    Yet another Plains of Eidolon clock : Warframe - Reddit
                  </a>
                </p>
              </div>
            </div>
          </div>
          <div className="card-deck my-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Screenshot</h5>
                <p>
                  <img
                    src={process.env.PUBLIC_URL + "/files/wf-clock.png"}
                    alt="Screenshot" />
                </p>
                <ul>
                  <li>
                    Night will come in 24 minutes and 44 seconds, ... plus{" "}
                    56 seconds. Assuming you are the host.
                  </li>
                  <li>
                    You know, the length of a night in Plains is not{" "}
                    constant. It's sometimes longer than 50 minutes,{" "}
                    sometimes shorter.
                  </li>
                  <li>
                    Note, the "+56s" is relevant to you only when you are{" "}
                    the host. Every squad member has their own, different{" "}
                    delta, for some reason. Ask DE developers why it{" "}
                    behaves so.
                  </li>
                  <li>
                    Also, keep in mind that the in-game time "drifts" --{" "}
                    time flows slightly faster or slower in this game,{" "}
                    depending on the PC specs and graphic settings.{" "}
                    The overlay cannot detect the drift at the moment.
                  </li>
                  <li>
                    The Arbitration location and Kuva Flood location are{" "}
                    not shown by default. They can be enabled from the{" "}
                    settings dialog.
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="card-deck my-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Usage</h5>
                <ul>
                  <li>
                    Just start the executable. The program stays in the{" "}
                    system tray, and shows the overlay clock when the game{" "}
                    is running.
                  </li>
                  <li>
                    Right click the system tray icon and choose 'Configure'{" "}
                    and you can reposition the clock or change the font.{" "}
                    (New in 2019-03-12)
                    <ul>
                      <li>
                        The settings are saved in{" "}
                        <code>&lt;path to the executable&gt;.Config</code>.</li>
                    </ul>
                  </li>
                  <li>
                    To terminate the program, right click the system tray{" "}
                    icon and select 'Quit'.
                  </li>
                  <li>
                    For hackers: The source code repository makes use of{" "}
                    the submodules in Git to import 3rd party material.{" "}
                    Use 'git clone --recursive' when{" "}
                    cloning it, or run 'git submodule update --init' later,{" "}
                    but before you compile it.{" "}
                    Pre-compiled binaries below are built with{" "}
                    Visual Studio 2019 Community (it's free!).
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="card-deck my-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Download</h5>
                <p className="font-weight-bold">
                  Compiled binary (2020-06-08; Fixed Arbitration tracker for{" "}
                  the current version of the game. Removed Kuva Flood tracker
                  temporarily until we find out another way to detect it.{" "}
                  Removed night sync display, which is no longer a thing{" "}
                  (This is a good news!).{" "}
                  Updated warframe-worldstate-data to the latest revision.): {" "}
                  <a href="https://poepoe.org/warframe/files/WarframeClock.2020-06-08.exe">
                    https://poepoe.org/warframe/files/WarframeClock.2020-06-08.exe
                  </a><br />
                  Full source code:{" "}
                  <a href="https://git.rhe.jp/wf-clock.git">
                    https://git.rhe.jp/wf-clock.git
                  </a>
                </p>
                <h6 className="card-title">Old versions</h6>
                <p className="text-muted"><s>
                  Compiled binary (2019-02-14; Initial public release):{" "}
                  <a href="https://poepoe.org/warframe/files/WarframeClock.2019-02-14.exe">
                    https://poepoe.org/warframe/files/WarframeClock.2019-02-14.exe
                  </a><br />
                  Compiled binary (2019-03-12; Allows repositioning of the clock):{" "}
                  <a href="https://poepoe.org/warframe/files/WarframeClock.2019-03-12.exe">
                    https://poepoe.org/warframe/files/WarframeClock.2019-03-12.exe
                  </a><br />
                  Compiled binary (2019-03-27; Removed Orb Vallis Wheather timer):{" "}
                  <a href="https://poepoe.org/warframe/files/WarframeClock.2019-03-27.exe">
                    https://poepoe.org/warframe/files/WarframeClock.2019-03-27.exe
                  </a><br />
                  Compiled binary (2019-04-02; Shows accurate PoE clock for the host by{" "}
                  using information from EE.log. Needs more testing):{" "}
                  <a href="https://poepoe.org/warframe/files/WarframeClock.2019-04-02.exe">
                    https://poepoe.org/warframe/files/WarframeClock.2019-04-02.exe
                  </a><br />
                  Compiled binary (2019-04-06; Fixed showing wrong time when in Cetus.{" "}
                  Still needs more testing):{" "}
                  <a href="https://poepoe.org/warframe/files/WarframeClock.2019-04-06.exe">
                    https://poepoe.org/warframe/files/WarframeClock.2019-04-06.exe
                  </a><br />
                  Compiled binary (2019-05-06; Added Arbitration and Kuva Flood trackers.{" "}
                  Where is my Aura Forma?):{" "}
                  <a href="https://poepoe.org/warframe/files/WarframeClock.2019-05-06.exe">
                    https://poepoe.org/warframe/files/WarframeClock.2019-05-06.exe
                  </a><br />
                  Compiled binary (2019-06-22; Shows PoE clock like "1h27m11s" (rather than the
                  current "87m11s") when there is more than an hour remaining. Fixed Kuva Flood
                  tracker sometimes showing wrong node):{" "}
                  <a href="https://poepoe.org/warframe/files/WarframeClock.2019-06-22.exe">
                    https://poepoe.org/warframe/files/WarframeClock.2019-06-22.exe
                  </a><br />
                  Compiled binary (2019-07-14; Fixed offset not being shown on systems where
                  the default decimal point is comma rather than period. Thanks to DaRaSTM for
                  the help :3  <small>NOTE (2019-07-16): Binary has been replaced with the{" "}
                  correct version number</small>):{" "}
                  <a href="https://poepoe.org/warframe/files/WarframeClock.2019-07-14.exe">
                    https://poepoe.org/warframe/files/WarframeClock.2019-07-14.exe
                  </a><br />
                  Compiled binary (2019-07-20; <s>Possibly fixed the unfocusing issue.{" "}
                  Maybe not. Uh. </s>Seems like it did the trick. It now uses WS_EX_NOACTIVATE{" "}
                  extended window style to not get focus):{" "}
                  <a href="https://poepoe.org/warframe/files/WarframeClock.2019-07-20.exe">
                    https://poepoe.org/warframe/files/WarframeClock.2019-07-20.exe
                  </a><br />
                  Compiled binary (2019-10-06; Fixed the overlay sometimes remaining topmost{" "}
                  after switching to another window.{" "}Added experimental 'Standalone' mode:{" "}
                  the clock works as a separate normal window.{" "}
                  Updated warframe-worldstate-data to the latest revision):{" "}
                  <a href="https://poepoe.org/warframe/files/WarframeClock.2019-10-06.exe">
                    https://poepoe.org/warframe/files/WarframeClock.2019-10-06.exe
                  </a><br />
                  Compiled binary (2019-10-06v2; Removed window title and borders from the{" "}
                  standalone mode):{" "}
                  <a href="https://poepoe.org/warframe/files/WarframeClock.2019-10-06v2.exe">
                    https://poepoe.org/warframe/files/WarframeClock.2019-10-06v2.exe
                  </a><br />
                </s></p>
              </div>
            </div>
          </div>
          <div className="card-deck my-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">wf-clock for X11</h5>
                <p>
                  Playing Warframe on Linux?{" "}
                  Here is an alternative version built with Ruby/GTK3 - the Windows version{" "}
                  is built with WPF and will not work properly on Linux.
                </p>
                <p>
                  Similarly to the Windows version, the overlay tries to find Warframe's{" "}
                  main window and stick to it.
                </p>
                <p>
                  Arbitration and Kuva Flood trackers are not implemented{" "}
                  because I no longer play these daily.
                </p>
                <p>
                  <pre style={{ background: "#cccccc" }}><code>
                    $ git clone https://git.rhe.jp/wf-clock.git && cd wf-clock/gtk3<br />
                    $ # Check 'README' and follow the instructions<br />
                  </code></pre>
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}
