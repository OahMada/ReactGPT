import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';

import { Button } from '../styled/button';
import { useKeys, HotkeyMapData } from '../utils';

export var Header = () => {
	let navigate = useNavigate();
	let location = useLocation();

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

	let clickExitButton = () => {
		navigate(-1);
	};
	let { 'Hotkey Map Page': hotkeyMapHotkeys } = HotkeyMapData();
	useKeys({ keyBinding: hotkeyMapHotkeys.exit.hotkey, callback: clickExitButton });

	return (
		<StyledHeader>
			<div>
				{/hotkey$/.test(location.pathname) && (
					<Button onClick={clickExitButton} data-tooltip-id='hotkey' data-tooltip-content={hotkeyMapHotkeys.exit.label}>
						Exit
					</Button>
				)}
				{!/hotkey$/.test(location.pathname) && (
					<>
						<Button onClick={handleClickConfigBtn} data-tooltip-id='hotkey' data-tooltip-content={articlePageHotkeys.enterConfig.label}>
							Config
						</Button>
						<Button onClick={handleClickHotkeyMapBtn} data-tooltip-id='hotkey' data-tooltip-content={articlePageHotkeys.enterHotkeyMap.label}>
							Hotkey Map
						</Button>
					</>
				)}
			</div>
		</StyledHeader>
	);
};

var StyledHeader = styled.header`
	position: fixed;
	z-index: 1;
	top: 0;
	width: 100dvw;
	height: var(--header-height);
	background-color: white;
	box-shadow: 0 1rem 1rem rgb(0 0 0 / 10%);

	div {
		display: flex;
		width: 100%;
		max-width: 110rem;
		height: 100%;
		align-items: center;
		justify-content: flex-end;
		padding: 0 50px;
		margin: 0 auto;
		gap: var(--gap-big);
	}
`;
