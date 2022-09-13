import { Grid, Text } from "@mantine/core";
import React from "react";
import {
  brick,
  bubble,
  colorful,
  doodles,
  dot,
  sakura,
  weather,
  blue,
  green,
  red,
  yellow,
} from "../../../images";
import { useRecoilState } from "recoil";
import { canvasBackgroundState } from "../../../atoms/canvasAtom";

const DrawerContent = () => {
  const [canvasBackground, setCanvasBackground] = useRecoilState(
    canvasBackgroundState
  );

  return (
    <div>
      <h4>Canvas Background</h4>
      {/* Background Sample */}
      <div className="backgroundWrapper">
        <button
          onClick={() => setCanvasBackground("dot")}
          className="backgroundItem"
          style={{ backgroundImage: `url(${dot})` }}
        />
        <button
          onClick={() => setCanvasBackground("bubble")}
          className="backgroundItem"
          style={{ backgroundImage: `url(${bubble})` }}
        />
        <button
          onClick={() => setCanvasBackground("brick")}
          className="backgroundItem"
          style={{ backgroundImage: `url(${brick})` }}
        />
        <button
          onClick={() => setCanvasBackground("sakura")}
          className="backgroundItem"
          style={{ backgroundImage: `url(${sakura})` }}
        />
        <button
          onClick={() => setCanvasBackground("colorful")}
          className="backgroundItem"
          style={{ backgroundImage: `url(${colorful})` }}
        />
        <button
          onClick={() => setCanvasBackground("doodle")}
          className="backgroundItem"
          style={{ backgroundImage: `url(${doodles})` }}
        />
        <button
          onClick={() => setCanvasBackground("weather")}
          className="backgroundItem"
          style={{ backgroundImage: `url(${weather})` }}
        />
        <button
          onClick={() => setCanvasBackground("blue")}
          className="backgroundItem"
          style={{ backgroundImage: `url(${blue})` }}
        />
        <button
          onClick={() => setCanvasBackground("green")}
          className="backgroundItem"
          style={{ backgroundImage: `url(${green})` }}
        />
        <button
          onClick={() => setCanvasBackground("red")}
          className="backgroundItem"
          style={{ backgroundImage: `url(${red})` }}
        />
        <button
          onClick={() => setCanvasBackground("yellow")}
          className="backgroundItem"
          style={{ backgroundImage: `url(${yellow})` }}
        />
      </div>
      <div></div>
    </div>
  );
};

export default DrawerContent;
