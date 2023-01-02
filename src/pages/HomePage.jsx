import styled from 'styled-components';
import { Card } from '../components/Card';
import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect } from 'react';
import {
  getContacts,
  selectContacts,
  selectVisibleContacts,
} from '../features/contacts-slice';
import { Controls } from '../components/Controls';
import { selectControls } from '../features/controls-slice';

const SectionStyled = styled.section`
  padding-bottom: 100px;
`;

const WrapperStyled = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, 250px);
  justify-content: space-between;
  row-gap: 41px;
`;
export const HomePage = () => {
  const dispatch = useDispatch();
  const controls = useSelector(selectControls);
  const contacts = useSelector(state => selectVisibleContacts(state, controls));
  const { status, error } = useSelector(selectContacts);

  useEffect(() => {
    dispatch(getContacts());
  }, [dispatch]);

  return (
    <SectionStyled>
      <Controls />
      <WrapperStyled>
        {error && <h2>Can't fetch data</h2>}
        {status === 'loading' && <h2>Loading...</h2>}
        {status === 'received' &&
          contacts.map(item => <Card key={item.id} {...item} />)}
      </WrapperStyled>
    </SectionStyled>
  );
};
