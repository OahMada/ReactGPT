import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

import { Button } from '../styles';
import { useKeys, HotkeyMapData } from '../utils';

export var Header = () => {
	let navigate = useNavigate();
	let { 'Article Page': articlePageHotkeys } = HotkeyMapData();

	let handleClickConfigBtn = () => {
		navigate('/config');
	};
	let handleClickHotkeyMapBtn = () => {
		navigate('/hotkey');
	};

	// hotkey for entering config page
	useKeys({
		keyBinding: articlePageHotkeys.enterConfig.hotkey,
		callback: handleClickConfigBtn,
	});

	// hotkey for entering hotkey map page
	useKeys({
		keyBinding: articlePageHotkeys.enterHotkeyMap.hotkey,
		callback: handleClickHotkeyMapBtn,
	});

	return (
		<StyledHeader>
			<Button onClick={handleClickConfigBtn} data-tooltip-id='hotkey' data-tooltip-content={articlePageHotkeys.enterConfig.label}>
				Config
			</Button>
			<Button onClick={handleClickHotkeyMapBtn} data-tooltip-id='hotkey' data-tooltip-content={articlePageHotkeys.enterHotkeyMap.label}>
				Hotkey Map
			</Button>
		</StyledHeader>
	);
};

var StyledHeader = styled.header`
	position: fixed;
	z-index: 500;
	top: 0;
	display: flex;
	width: 100vw;
	height: min(7rem, 100px);
	align-items: center;
	justify-content: flex-end;
	padding: 0 50px;
	background-color: white;
	box-shadow: 0 1rem 1rem rgb(0 0 0 / 10%);
	gap: var(--gap-big);
`;
