import styles from './List.module.css';
import PropTypes from 'prop-types';

function List(props) {
    const { category, items } = props;

    // Sort the items according to their movie names in descending order of their rating
    items.sort((a, b) => b.rating - a.rating);
    
    const listItems = items.map(item => (
        <li key={item.id}>{item.name}: &nbsp; {item.rating}</li>
    ));

    return (
        <>
            <h3 className={styles.h3List}>{category}</h3>
            <ul className={styles.ulList}>{listItems}</ul>
        </>
    );
}

List.propTypes = {
    category: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            movie: PropTypes.string.isRequired,
            rating: PropTypes.number.isRequired,
        })
    ).isRequired,
};

export default List;
